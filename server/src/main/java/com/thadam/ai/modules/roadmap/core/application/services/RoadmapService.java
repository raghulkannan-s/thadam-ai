package com.thadam.ai.modules.roadmap.core.application.services;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.exception.ForbiddenException;
import com.thadam.ai.common.exception.NotFoundException;
import com.thadam.ai.common.enums.SubscriptionPlan;
import com.thadam.ai.modules.roadmap.core.application.dtos.CommunityRoadmapResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.MilestoneRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.MilestoneResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapUpdateRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.TaskRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.TaskResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.TaskUpdateRequest;
import com.thadam.ai.modules.roadmap.core.domain.entities.Milestone;
import com.thadam.ai.modules.roadmap.core.domain.entities.Roadmap;
import com.thadam.ai.modules.roadmap.core.domain.entities.Task;
import com.thadam.ai.modules.roadmap.core.domain.entities.Vote;
import com.thadam.ai.modules.roadmap.core.domain.enums.VoteType;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility;
import com.thadam.ai.modules.roadmap.core.domain.enums.TaskStatus;
import com.thadam.ai.modules.roadmap.core.domain.enums.TaskPriority;
import com.thadam.ai.modules.roadmap.core.domain.enums.MilestoneStatus;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.MilestoneRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.TaskRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.VoteRepository;
import com.thadam.ai.modules.community.infrastructure.repositories.FollowRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.RoadmapRepository;
import org.springframework.context.ApplicationEventPublisher;
import com.thadam.ai.modules.gamification.core.domain.events.TaskCompletedEvent;
import com.thadam.ai.modules.ledger.core.application.services.LedgerService;
import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionRequest;
import com.thadam.ai.modules.ledger.core.domain.enums.TransactionType;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RoadmapService {

    private static final Logger log = LoggerFactory.getLogger(RoadmapService.class);

    private final RoadmapRepository roadmapRepository;
    private final MilestoneRepository milestoneRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final FollowRepository followRepository;
    private final AuditService auditService;
    private final ApplicationEventPublisher eventPublisher;
    private final LedgerService ledgerService;

    @jakarta.annotation.PostConstruct
    @Transactional
    public void migratePublicIds() {
        List<Roadmap> roadmaps = roadmapRepository.findAll();
        boolean updated = false;
        for (Roadmap r : roadmaps) {
            if (r.getPublicId() == null) {
                r.setPublicId(java.util.UUID.randomUUID().toString());
                updated = true;
            }
        }
        if (updated) {
            roadmapRepository.saveAll(roadmaps);
            log.info("Migrated existing roadmaps to have a publicId");
        }
    }

    @Transactional
    @CacheEvict(value = "roadmaps", allEntries = true)
    public RoadmapResponse createRoadmap(RoadmapRequest request, User user) {
        Roadmap roadmap = Roadmap.builder()
                .title(request.title())
                .description(request.description())
                .user(user)
                .build();
        Roadmap saved = roadmapRepository.save(roadmap);
        return toRoadmapResponse(saved);
    }

    // We remove @Cacheable here because the permission check depends on the user
    public RoadmapResponse getRoadmapById(String publicId, User user) {
        Roadmap roadmap = roadmapRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + publicId));

        RoadmapVisibility vis = roadmap.getVisibility();
        boolean isOwner = roadmap.getUser().getId().equals(user.getId());

        if (!isOwner && (vis == RoadmapVisibility.DRAFT || vis == RoadmapVisibility.PRIVATE)) {
            throw new ForbiddenException("You do not have permission to view this roadmap");
        }

        return toRoadmapResponse(roadmap);
    }

    public CommunityRoadmapResponse getCommunityRoadmapById(String publicId, User user) {
        Roadmap roadmap = roadmapRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + publicId));

        RoadmapVisibility vis = roadmap.getVisibility();
        boolean isOwner = (user != null) && roadmap.getUser().getId().equals(user.getId());

        if (!isOwner && (vis == RoadmapVisibility.DRAFT || vis == RoadmapVisibility.PRIVATE)) {
            throw new ForbiddenException("You do not have permission to view this roadmap");
        }

        List<Long> roadmapIds = List.of(roadmap.getId());
        java.util.Map<Long, Long> upvotesMap = listToMap(voteRepository.countVotesByRoadmapIdsAndType(roadmapIds, VoteType.UPVOTE));
        java.util.Map<Long, Long> downvotesMap = listToMap(voteRepository.countVotesByRoadmapIdsAndType(roadmapIds, VoteType.DOWNVOTE));
        java.util.Map<Long, Long> forksMap = listToMap(roadmapRepository.countForksByRoadmapIdIn(roadmapIds));
        java.util.Map<Long, Long> msMap = listToMap(milestoneRepository.countByRoadmapIdIn(roadmapIds));
        java.util.Map<Long, Long> tasksMap = listToMap(taskRepository.countByRoadmapIdIn(roadmapIds));
        
        Vote userVote = null;
        if (user != null) {
            List<Vote> votes = voteRepository.findByUserIdAndRoadmapIdIn(user.getId(), roadmapIds);
            if (!votes.isEmpty()) {
                userVote = votes.get(0);
            }
        }

        long upvotes = upvotesMap.getOrDefault(roadmap.getId(), 0L);
        long downvotes = downvotesMap.getOrDefault(roadmap.getId(), 0L);
        int forkCount = forksMap.getOrDefault(roadmap.getId(), 0L).intValue();
        long msCount = msMap.getOrDefault(roadmap.getId(), 0L);
        long tCount = tasksMap.getOrDefault(roadmap.getId(), 0L);

        return new CommunityRoadmapResponse(
                roadmap.getPublicId(),
                roadmap.getTitle(),
                roadmap.getDescription(),
                roadmap.getStatus(),
                roadmap.getVisibility(),
                roadmap.getUser().getPublicId(),
                roadmap.getUser().getName(),
                roadmap.getDifficulty(),
                roadmap.getDurationWeeks(),
                roadmap.getEstimatedHoursPerDay(),
                roadmap.getStartDate(),
                (int) msCount,
                (int) tCount,
                upvotes,
                downvotes,
                userVote != null ? userVote.getVoteType().name() : null,
                roadmap.getForkedFrom() != null ? roadmap.getForkedFrom().getPublicId() : null,
                forkCount,
                roadmap.getCreatedAt(),
                roadmap.getUpdatedAt());
    }

    public Page<RoadmapResponse> getRoadmapsByUser(Long userId, Pageable pageable) {
        return toRoadmapResponsePage(roadmapRepository.findByUserId(userId, pageable));
    }

    public Page<CommunityRoadmapResponse> searchRoadmaps(String query, Pageable pageable, User currentUser) {
        return hydrateCommunityRoadmaps(roadmapRepository.searchByTitleOrDescription(query, pageable), currentUser);
    }

    @Transactional
    @CacheEvict(value = "roadmaps", key = "#publicId")
    public RoadmapResponse updateRoadmap(String publicId, RoadmapUpdateRequest request, User user) {
        Roadmap roadmap = roadmapRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + publicId));
        assertOwnership(roadmap, user);
        roadmap.setTitle(request.title());
        roadmap.setDescription(request.description());
        if (request.status() != null) {
            roadmap.setStatus(request.status());
        }
        if (request.visibility() != null) {
            roadmap.setVisibility(request.visibility());
        }
        Roadmap saved = roadmapRepository.save(roadmap);
        return toRoadmapResponse(saved);
    }

    @Transactional
    public void incrementViewCount(String publicId) {
        roadmapRepository.findByPublicId(publicId).ifPresent(r -> roadmapRepository.incrementViewCount(r.getId()));
    }



    @Transactional
    @CacheEvict(value = "roadmaps", key = "#publicId")
    public RoadmapResponse forceUpdateVisibility(String publicId, RoadmapVisibility visibility) {
        Roadmap roadmap = roadmapRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + publicId));
        
        RoadmapVisibility oldVisibility = roadmap.getVisibility();
        roadmap.setVisibility(visibility);
        Roadmap saved = roadmapRepository.save(roadmap);

        String performedBy = MDC.get("userId");
        log.info("ROADMAP_FORCE_VISIBILITY_CHANGE roadmapId={} oldVisibility={} newVisibility={} performedBy={} correlationId={}",
                publicId, oldVisibility, visibility, performedBy, MDC.get("correlationId"));
        
        return toRoadmapResponse(saved);
    }

    public Page<CommunityRoadmapResponse> getAllRoadmapsForModeration(Pageable pageable) {
        Page<Roadmap> roadmaps = roadmapRepository.findAll(pageable);
        return hydrateCommunityRoadmaps(roadmaps, null);
    }

    @Transactional
    @CacheEvict(value = "roadmaps", key = "#publicId")
    public void deleteRoadmap(String publicId, User user) {
        Roadmap roadmap = roadmapRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + publicId));
        assertOwnership(roadmap, user);
        log.info("ROADMAP_DELETED roadmapId={} title={} userId={} correlationId={}",
                roadmap.getId(), roadmap.getTitle(), user.getId(), MDC.get("correlationId"));
        auditService.roadmapDeleted(roadmap.getId(), user.getId());
        roadmapRepository.delete(roadmap);
    }

    @Transactional
    public MilestoneResponse createMilestone(String roadmapId, MilestoneRequest request, User user) {
        Roadmap roadmap = roadmapRepository.findByPublicId(roadmapId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + roadmapId));
        assertOwnership(roadmap, user);
        Milestone milestone = Milestone.builder()
                .title(request.title())
                .description(request.description())
                .roadmap(roadmap)
                .orderIndex(request.orderIndex())
                .dueDate(request.dueDate())
                .build();
        Milestone saved = milestoneRepository.save(milestone);
        return toMilestoneResponse(saved);
    }

    public MilestoneResponse getMilestoneById(Long id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Milestone not found with id: " + id));
        return toMilestoneResponse(milestone);
    }

    @Transactional
    public MilestoneResponse updateMilestone(Long id, MilestoneRequest request, User user) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Milestone not found with id: " + id));
        assertOwnership(milestone.getRoadmap(), user);
        milestone.setTitle(request.title());
        milestone.setDescription(request.description());
        milestone.setOrderIndex(request.orderIndex());
        milestone.setDueDate(request.dueDate());
        Milestone saved = milestoneRepository.save(milestone);
        return toMilestoneResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "roadmaps", key = "#result.roadmapId()")
    public void deleteMilestone(Long id, User user) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Milestone not found with id: " + id));
        assertOwnership(milestone.getRoadmap(), user);
        milestoneRepository.delete(milestone);
    }

    @Transactional
    @CacheEvict(value = "roadmaps", key = "#result.roadmapId()")
    public TaskResponse createTask(String roadmapId, TaskRequest request, User user) {
        Roadmap roadmap = roadmapRepository.findByPublicId(roadmapId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + roadmapId));
        assertOwnership(roadmap, user);
        Milestone milestone = null;
        if (request.milestoneId() != null) {
            milestone = milestoneRepository.findById(request.milestoneId())
                    .orElseThrow(() -> new NotFoundException("Milestone not found with id: " + request.milestoneId()));
        }

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new NotFoundException("User not found with id: " + request.assigneeId()));
        }

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .milestone(milestone)
                .roadmap(roadmap)
                .assignee(assignee)
                .priority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM)
                .orderIndex(request.orderIndex())
                .dueDate(request.dueDate())
                .build();
        Task saved = taskRepository.save(task);
        return toTaskResponse(saved);
    }

    public Page<TaskResponse> getTasksByRoadmap(String roadmapId, Pageable pageable) {
        Roadmap roadmap = roadmapRepository.findByPublicId(roadmapId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + roadmapId));
        return taskRepository.findByRoadmapId(roadmap.getId(), pageable)
                .map(this::toTaskResponse);
    }

    public List<MilestoneResponse> getMilestonesByRoadmap(String roadmapId) {
        Roadmap roadmap = roadmapRepository.findByPublicId(roadmapId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + roadmapId));
        return milestoneRepository.findByRoadmapIdOrderByOrderIndexAsc(roadmap.getId())
                .stream()
                .map(this::toMilestoneResponse)
                .toList();
    }

    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found with id: " + id));
        return toTaskResponse(task);
    }

    @Transactional
    @CacheEvict(value = "roadmaps", key = "#result.roadmapId()")
    public TaskResponse updateTask(Long id, TaskUpdateRequest request, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found with id: " + id));
        assertOwnership(task.getRoadmap(), user);

        if (request.title() != null) task.setTitle(request.title());
        if (request.description() != null) task.setDescription(request.description());
        if (request.status() != null) {
            TaskStatus oldStatus = task.getStatus();
            task.setStatus(request.status());
            if (oldStatus != TaskStatus.DONE && request.status() == TaskStatus.DONE) {
                eventPublisher.publishEvent(new TaskCompletedEvent(user.getId(), task.getId()));
                
                if (!task.isCoinGranted()) {
                    Long originalRoadmapId = task.getRoadmap().getForkedFrom() != null 
                        ? task.getRoadmap().getForkedFrom().getId() 
                        : task.getRoadmap().getId();

                    if (!ledgerService.hasEarnedCoinForReference(user.getId(), "ROADMAP_COMPLETION", originalRoadmapId)) {
                        ledgerService.addTransaction(user, new CoinTransactionRequest(
                                1,
                                TransactionType.EARNED,
                                "Roadmap Progress Reward",
                                "ROADMAP_COMPLETION",
                                originalRoadmapId
                        ));
                    }
                    task.setCoinGranted(true);
                }
            }
        }
        if (request.priority() != null) task.setPriority(request.priority());
        if (request.orderIndex() != null) task.setOrderIndex(request.orderIndex());
        if (request.dueDate() != null) task.setDueDate(request.dueDate());

        if (request.milestoneId() != null) {
            Milestone milestone = milestoneRepository.findById(request.milestoneId())
                    .orElseThrow(() -> new NotFoundException("Milestone not found with id: " + request.milestoneId()));
            task.setMilestone(milestone);
        }

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new NotFoundException("User not found with id: " + request.assigneeId()));
            task.setAssignee(assignee);
        }

        Task saved = taskRepository.save(task);

        if (saved.getMilestone() != null && saved.getStatus() == TaskStatus.DONE) {
            long totalTasks = taskRepository.countByMilestoneId(saved.getMilestone().getId());
            long completedTasks = taskRepository.countByMilestoneIdAndStatus(saved.getMilestone().getId(), TaskStatus.DONE);
            if (totalTasks > 0 && totalTasks == completedTasks) {
                Milestone m = saved.getMilestone();
                m.setStatus(MilestoneStatus.COMPLETED);
                milestoneRepository.save(m);
            }
        }

        return toTaskResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "roadmaps", key = "#result.roadmapId()")
    public void deleteTask(Long id, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found with id: " + id));
        assertOwnership(task.getRoadmap(), user);
        taskRepository.delete(task);
    }

    @Transactional
    public RoadmapResponse forkRoadmap(String publicId, String visibilityStr, User user) {
        Roadmap original = roadmapRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + publicId));

        log.info("ROADMAP_FORK_STARTED originalId={} userId={} correlationId={}",
                original.getId(), user.getId(), MDC.get("correlationId"));

        if (original.getVisibility() != RoadmapVisibility.PUBLIC) {
            throw new ForbiddenException("You can only fork PUBLIC roadmaps");
        }

        if (roadmapRepository.existsByForkedFromIdAndUserId(original.getId(), user.getId())) {
            throw new ForbiddenException("You have already forked this roadmap");
        }

        if (user.getPlan() == SubscriptionPlan.FREE) {
            long forkCount = roadmapRepository.countByUserIdAndForkedFromIsNotNull(user.getId());
            if (forkCount >= 3) {
                throw new ForbiddenException("Free users can only have up to 3 active forks. Please unfork a roadmap or upgrade to Premium.");
            }
        }

        Roadmap fork = Roadmap.builder()
                .title(original.getTitle() + " (forked)")
                .description(original.getDescription())
                .user(user)
                .visibility(RoadmapVisibility.valueOf(visibilityStr))
                .forkedFrom(original)
                .build();
        fork = roadmapRepository.save(fork);

        List<Milestone> originalMilestones = milestoneRepository.findByRoadmapIdOrderByOrderIndexAsc(original.getId());
        List<Task> allNewTasks = new ArrayList<>();
        
        for (Milestone origMs : originalMilestones) {
            Milestone newMs = Milestone.builder()
                    .title(origMs.getTitle())
                    .description(origMs.getDescription())
                    .roadmap(fork)
                    .orderIndex(origMs.getOrderIndex())
                    .dueDate(origMs.getDueDate())
                    .build();
            newMs = milestoneRepository.save(newMs);

            List<Task> origTasks = taskRepository.findByMilestoneIdOrderByOrderIndexAsc(origMs.getId());
            for (Task origTask : origTasks) {
                allNewTasks.add(Task.builder()
                        .title(origTask.getTitle())
                        .description(origTask.getDescription())
                        .milestone(newMs)
                        .roadmap(fork)
                        .priority(origTask.getPriority())
                        .orderIndex(origTask.getOrderIndex())
                        .dueDate(origTask.getDueDate())
                        .build());
            }
        }
        
        if (!allNewTasks.isEmpty()) {
            taskRepository.saveAll(allNewTasks);
        }

        log.info("ROADMAP_FORK_COMPLETED forkedId={} originalId={} userId={} correlationId={}",
                fork.getId(), original.getId(), user.getId(), MDC.get("correlationId"));
        auditService.communityAction("FORK", original.getId(), user.getId());

        return toRoadmapResponse(fork);
    }

    public Page<CommunityRoadmapResponse> getTrendingRoadmaps(Pageable pageable, User currentUser) {
        Page<Roadmap> page = roadmapRepository.findTrending(pageable);
        return hydrateCommunityRoadmaps(page, currentUser);
    }

    public Page<CommunityRoadmapResponse> getNewestRoadmaps(Pageable pageable, User currentUser) {
        Page<Roadmap> page = roadmapRepository.findNewest(pageable);
        return hydrateCommunityRoadmaps(page, currentUser);
    }

    public Page<CommunityRoadmapResponse> getFollowingRoadmaps(Pageable pageable, User currentUser) {
        if (currentUser == null) return Page.empty(pageable);
        List<Long> followingIds = followRepository.findFollowingIdsByFollowerId(currentUser.getId());
        if (followingIds.isEmpty()) return Page.empty(pageable);

        Page<Roadmap> page = roadmapRepository.findByUserIdInAndVisibility(followingIds, RoadmapVisibility.PUBLIC, pageable);
        return hydrateCommunityRoadmaps(page, currentUser);
    }

    public Page<CommunityRoadmapResponse> getRecommendedRoadmaps(Pageable pageable, User currentUser) {
        // Placeholder for an ML recommendation engine, falling back to trending for now
        return getTrendingRoadmaps(pageable, currentUser);
    }

    public Page<CommunityRoadmapResponse> getRoadmapsByUserId(String userId, Pageable pageable, User currentUser) {
        User targetUser = userRepository.findByPublicId(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        Page<Roadmap> page = roadmapRepository.findByUserIdAndVisibility(targetUser.getId(), RoadmapVisibility.PUBLIC, pageable);
        return hydrateCommunityRoadmaps(page, currentUser);
    }

    private Page<CommunityRoadmapResponse> hydrateCommunityRoadmaps(Page<Roadmap> page, User currentUser) {
        List<Long> roadmapIds = page.getContent().stream().map(Roadmap::getId).toList();
        
        if (roadmapIds.isEmpty()) {
            return Page.empty(page.getPageable());
        }

        java.util.Map<Long, Long> upvotesMap = listToMap(voteRepository.countVotesByRoadmapIdsAndType(roadmapIds, VoteType.UPVOTE));
        java.util.Map<Long, Long> downvotesMap = listToMap(voteRepository.countVotesByRoadmapIdsAndType(roadmapIds, VoteType.DOWNVOTE));
        java.util.Map<Long, Long> forksMap = listToMap(roadmapRepository.countForksByRoadmapIdIn(roadmapIds));
        java.util.Map<Long, Long> msMap = listToMap(milestoneRepository.countByRoadmapIdIn(roadmapIds));
        java.util.Map<Long, Long> tasksMap = listToMap(taskRepository.countByRoadmapIdIn(roadmapIds));
        
        java.util.Map<Long, Vote> userVotesMap = new java.util.HashMap<>();
        if (currentUser != null) {
            voteRepository.findByUserIdAndRoadmapIdIn(currentUser.getId(), roadmapIds)
                    .forEach(v -> userVotesMap.put(v.getRoadmap().getId(), v));
        }

        return page.map(roadmap -> {
            long upvotes = upvotesMap.getOrDefault(roadmap.getId(), 0L);
            long downvotes = downvotesMap.getOrDefault(roadmap.getId(), 0L);
            Vote userVote = userVotesMap.get(roadmap.getId());
            int forkCount = forksMap.getOrDefault(roadmap.getId(), 0L).intValue();
            long msCount = msMap.getOrDefault(roadmap.getId(), 0L);
            long tCount = tasksMap.getOrDefault(roadmap.getId(), 0L);

            return new CommunityRoadmapResponse(
                    roadmap.getPublicId(),
                    roadmap.getTitle(),
                    roadmap.getDescription(),
                    roadmap.getStatus(),
                    roadmap.getVisibility(),
                    roadmap.getUser().getPublicId(),
                    roadmap.getUser().getName(),
                    roadmap.getDifficulty(),
                    roadmap.getDurationWeeks(),
                    roadmap.getEstimatedHoursPerDay(),
                    roadmap.getStartDate(),
                    (int) msCount,
                    (int) tCount,
                    upvotes,
                    downvotes,
                    userVote != null ? userVote.getVoteType().name() : null,
                    roadmap.getForkedFrom() != null ? roadmap.getForkedFrom().getPublicId() : null,
                    forkCount,
                    roadmap.getCreatedAt(),
                    roadmap.getUpdatedAt());
        });
    }

    private java.util.Map<Long, Long> listToMap(List<Object[]> results) {
        java.util.Map<Long, Long> map = new java.util.HashMap<>();
        for (Object[] result : results) {
            map.put(((Number) result[0]).longValue(), ((Number) result[1]).longValue());
        }
        return map;
    }

    private Page<RoadmapResponse> toRoadmapResponsePage(Page<Roadmap> page) {
        List<Long> roadmapIds = page.getContent().stream().map(Roadmap::getId).toList();
        if (roadmapIds.isEmpty()) return Page.empty(page.getPageable());
        
        java.util.Map<Long, Long> msMap = listToMap(milestoneRepository.countByRoadmapIdIn(roadmapIds));
        java.util.Map<Long, Long> tasksMap = listToMap(taskRepository.countByRoadmapIdIn(roadmapIds));
        
        return page.map(roadmap -> new RoadmapResponse(
                roadmap.getPublicId(),
                roadmap.getTitle(),
                roadmap.getDescription(),
                roadmap.getStatus(),
                roadmap.getVisibility(),
                roadmap.getUser().getPublicId(),
                roadmap.getDifficulty(),
                roadmap.getDurationWeeks(),
                roadmap.getEstimatedHoursPerDay(),
                roadmap.getStartDate(),
                msMap.getOrDefault(roadmap.getId(), 0L).intValue(),
                tasksMap.getOrDefault(roadmap.getId(), 0L).intValue(),
                roadmap.getForkedFrom() != null ? roadmap.getForkedFrom().getPublicId() : null,
                roadmap.getCreatedAt(),
                roadmap.getUpdatedAt()));
    }

    private void assertOwnership(Roadmap roadmap, User user) {
        if (!roadmap.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not own this roadmap");
        }
    }

    private RoadmapResponse toRoadmapResponse(Roadmap roadmap) {
        long milestoneCount = milestoneRepository.countByRoadmapId(roadmap.getId());
        long taskCount = taskRepository.countByRoadmapId(roadmap.getId());
        return new RoadmapResponse(
                roadmap.getPublicId(),
                roadmap.getTitle(),
                roadmap.getDescription(),
                roadmap.getStatus(),
                roadmap.getVisibility(),
                roadmap.getUser().getPublicId(),
                roadmap.getDifficulty(),
                roadmap.getDurationWeeks(),
                roadmap.getEstimatedHoursPerDay(),
                roadmap.getStartDate(),
                (int) milestoneCount,
                (int) taskCount,
                roadmap.getForkedFrom() != null ? roadmap.getForkedFrom().getPublicId() : null,
                roadmap.getCreatedAt(),
                roadmap.getUpdatedAt());
    }

    private MilestoneResponse toMilestoneResponse(Milestone milestone) {
        long taskCount = taskRepository.countByMilestoneId(milestone.getId());
        return new MilestoneResponse(
                milestone.getId(),
                milestone.getTitle(),
                milestone.getDescription(),
                milestone.getRoadmap().getPublicId(),
                milestone.getOrderIndex(),
                milestone.getDueDate(),
                milestone.getStatus(),
                (int) taskCount,
                milestone.getCreatedAt(),
                milestone.getUpdatedAt());
    }

    private TaskResponse toTaskResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getMilestone() != null ? task.getMilestone().getId() : null,
                task.getRoadmap().getPublicId(),
                task.getAssignee() != null ? task.getAssignee().getPublicId() : null,
                task.getStatus(),
                task.getPriority(),
                task.getOrderIndex(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }
}
