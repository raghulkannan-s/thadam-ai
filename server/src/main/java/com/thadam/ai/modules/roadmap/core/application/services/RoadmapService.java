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
import com.thadam.ai.modules.roadmap.infrastructure.repositories.MilestoneRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.TaskRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.VoteRepository;
import com.thadam.ai.modules.community.infrastructure.repositories.FollowRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.RoadmapRepository;
import org.springframework.context.ApplicationEventPublisher;
import com.thadam.ai.modules.gamification.core.domain.events.TaskCompletedEvent;

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

    @Cacheable(value = "roadmaps", key = "#id")
    public RoadmapResponse getRoadmapById(Long id) {
        Roadmap roadmap = roadmapRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + id));
        
        // Normally we'd track who viewed it. Since we don't pass User to this method right now,
        // we can just increment viewCount directly or we can pass a User object if we want to track streaks.
        // For now, let's just increment viewCount here directly.
        roadmap.setViewCount(roadmap.getViewCount() + 1);
        roadmapRepository.save(roadmap);

        return toRoadmapResponse(roadmap);
    }

    public Page<RoadmapResponse> getRoadmapsByUser(Long userId, Pageable pageable) {
        return toRoadmapResponsePage(roadmapRepository.findByUserId(userId, pageable));
    }

    public Page<RoadmapResponse> searchRoadmaps(String query, Pageable pageable) {
        return toRoadmapResponsePage(roadmapRepository.searchByTitleOrDescription(query, pageable));
    }

    @Transactional
    @CacheEvict(value = "roadmaps", key = "#id")
    public RoadmapResponse updateRoadmap(Long id, RoadmapUpdateRequest request, User user) {
        Roadmap roadmap = roadmapRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + id));
        assertOwnership(roadmap, user);
        roadmap.setTitle(request.title());
        roadmap.setDescription(request.description());
        if (request.status() != null) {
            roadmap.setStatus(request.status());
        }
        Roadmap saved = roadmapRepository.save(roadmap);
        return toRoadmapResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "roadmaps", key = "#id")
    public void deleteRoadmap(Long id, User user) {
        Roadmap roadmap = roadmapRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + id));
        assertOwnership(roadmap, user);
        log.info("ROADMAP_DELETED roadmapId={} title={} userId={} correlationId={}",
                id, roadmap.getTitle(), user.getId(), MDC.get("correlationId"));
        auditService.roadmapDeleted(id, user.getId());
        roadmapRepository.delete(roadmap);
    }

    @Transactional
    public MilestoneResponse createMilestone(Long roadmapId, MilestoneRequest request, User user) {
        Roadmap roadmap = roadmapRepository.findById(roadmapId)
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
    public TaskResponse createTask(Long roadmapId, TaskRequest request, User user) {
        Roadmap roadmap = roadmapRepository.findById(roadmapId)
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
                .priority(request.priority() != null ? request.priority() : com.thadam.ai.modules.roadmap.core.domain.enums.TaskPriority.MEDIUM)
                .orderIndex(request.orderIndex())
                .dueDate(request.dueDate())
                .build();
        Task saved = taskRepository.save(task);
        return toTaskResponse(saved);
    }

    public Page<TaskResponse> getTasksByRoadmap(Long roadmapId, Pageable pageable) {
        return taskRepository.findByRoadmapId(roadmapId, pageable)
                .map(this::toTaskResponse);
    }

    public List<MilestoneResponse> getMilestonesByRoadmap(Long roadmapId) {
        return milestoneRepository.findByRoadmapIdOrderByOrderIndexAsc(roadmapId)
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
            com.thadam.ai.modules.roadmap.core.domain.enums.TaskStatus oldStatus = task.getStatus();
            task.setStatus(request.status());
            if (oldStatus != com.thadam.ai.modules.roadmap.core.domain.enums.TaskStatus.DONE && request.status() == com.thadam.ai.modules.roadmap.core.domain.enums.TaskStatus.DONE) {
                eventPublisher.publishEvent(new TaskCompletedEvent(user.getId(), task.getId()));
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
    public RoadmapResponse forkRoadmap(Long id, User user) {
        Roadmap original = roadmapRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + id));

        log.info("ROADMAP_FORK_STARTED originalId={} userId={} correlationId={}",
                id, user.getId(), MDC.get("correlationId"));

        Roadmap fork = Roadmap.builder()
                .title(original.getTitle() + " (forked)")
                .description(original.getDescription())
                .user(user)
                .forkedFrom(original)
                .build();
        fork = roadmapRepository.save(fork);

        List<Milestone> originalMilestones = milestoneRepository.findByRoadmapIdOrderByOrderIndexAsc(id);
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
            List<Task> newTasks = new ArrayList<>();
            for (Task origTask : origTasks) {
                newTasks.add(Task.builder()
                        .title(origTask.getTitle())
                        .description(origTask.getDescription())
                        .milestone(newMs)
                        .roadmap(fork)
                        .priority(origTask.getPriority())
                        .orderIndex(origTask.getOrderIndex())
                        .dueDate(origTask.getDueDate())
                        .build());
            }
            if (!newTasks.isEmpty()) {
                taskRepository.saveAll(newTasks);
            }
        }

        log.info("ROADMAP_FORK_COMPLETED forkedId={} originalId={} userId={} correlationId={}",
                fork.getId(), id, user.getId(), MDC.get("correlationId"));
        auditService.communityAction("FORK", id, user.getId());

        return toRoadmapResponse(fork);
    }

    @Cacheable(value = "roadmaps", key = "'trending-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<CommunityRoadmapResponse> getTrendingRoadmaps(Pageable pageable, User currentUser) {
        Page<Roadmap> page = roadmapRepository.findTrending(pageable);
        return hydrateCommunityRoadmaps(page, currentUser);
    }

    @Cacheable(value = "roadmaps", key = "'newest-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<CommunityRoadmapResponse> getNewestRoadmaps(Pageable pageable, User currentUser) {
        Page<Roadmap> page = roadmapRepository.findNewest(pageable);
        return hydrateCommunityRoadmaps(page, currentUser);
    }

    public Page<CommunityRoadmapResponse> getFollowingRoadmaps(Pageable pageable, User currentUser) {
        if (currentUser == null) return Page.empty(pageable);
        List<Long> followingIds = followRepository.findFollowingIdsByFollowerId(currentUser.getId());
        if (followingIds.isEmpty()) return Page.empty(pageable);

        Page<Roadmap> page = roadmapRepository.findByUserIdInAndVisibility(followingIds, "PUBLIC", pageable);
        return hydrateCommunityRoadmaps(page, currentUser);
    }

    public Page<CommunityRoadmapResponse> getRecommendedRoadmaps(Pageable pageable, User currentUser) {
        // Placeholder for an ML recommendation engine, falling back to trending for now
        return getTrendingRoadmaps(pageable, currentUser);
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
                    roadmap.getId(),
                    roadmap.getTitle(),
                    roadmap.getDescription(),
                    roadmap.getStatus(),
                    roadmap.getUser().getId(),
                    roadmap.getUser().getName(),
                    (int) msCount,
                    (int) tCount,
                    upvotes,
                    downvotes,
                    userVote != null ? userVote.getVoteType().name() : null,
                    roadmap.getForkedFrom() != null ? roadmap.getForkedFrom().getId() : null,
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
                roadmap.getId(),
                roadmap.getTitle(),
                roadmap.getDescription(),
                roadmap.getStatus(),
                roadmap.getUser().getId(),
                msMap.getOrDefault(roadmap.getId(), 0L).intValue(),
                tasksMap.getOrDefault(roadmap.getId(), 0L).intValue(),
                roadmap.getForkedFrom() != null ? roadmap.getForkedFrom().getId() : null,
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
                roadmap.getId(),
                roadmap.getTitle(),
                roadmap.getDescription(),
                roadmap.getStatus(),
                roadmap.getUser().getId(),
                (int) milestoneCount,
                (int) taskCount,
                roadmap.getForkedFrom() != null ? roadmap.getForkedFrom().getId() : null,
                roadmap.getCreatedAt(),
                roadmap.getUpdatedAt());
    }

    private MilestoneResponse toMilestoneResponse(Milestone milestone) {
        long taskCount = taskRepository.countByMilestoneId(milestone.getId());
        return new MilestoneResponse(
                milestone.getId(),
                milestone.getTitle(),
                milestone.getDescription(),
                milestone.getRoadmap().getId(),
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
                task.getRoadmap().getId(),
                task.getAssignee() != null ? task.getAssignee().getId() : null,
                task.getStatus(),
                task.getPriority(),
                task.getOrderIndex(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }
}
