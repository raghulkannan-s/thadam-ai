package com.thadam.ai.roadmap.service;

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

import com.thadam.ai.auth.entity.User;
import com.thadam.ai.auth.repository.UserRepository;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.exception.ForbiddenException;
import com.thadam.ai.common.exception.NotFoundException;
import com.thadam.ai.roadmap.dto.CommunityRoadmapResponse;
import com.thadam.ai.roadmap.dto.MilestoneRequest;
import com.thadam.ai.roadmap.dto.MilestoneResponse;
import com.thadam.ai.roadmap.dto.RoadmapRequest;
import com.thadam.ai.roadmap.dto.RoadmapResponse;
import com.thadam.ai.roadmap.dto.RoadmapUpdateRequest;
import com.thadam.ai.roadmap.dto.TaskRequest;
import com.thadam.ai.roadmap.dto.TaskResponse;
import com.thadam.ai.roadmap.dto.TaskUpdateRequest;
import com.thadam.ai.roadmap.entity.Milestone;
import com.thadam.ai.roadmap.entity.Roadmap;
import com.thadam.ai.roadmap.entity.Task;
import com.thadam.ai.roadmap.entity.Vote;
import com.thadam.ai.roadmap.enums.VoteType;
import com.thadam.ai.roadmap.repository.MilestoneRepository;
import com.thadam.ai.roadmap.repository.RoadmapRepository;
import com.thadam.ai.roadmap.repository.TaskRepository;
import com.thadam.ai.roadmap.repository.VoteRepository;

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
    private final AuditService auditService;

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
        return toRoadmapResponse(roadmap);
    }

    public Page<RoadmapResponse> getRoadmapsByUser(Long userId, Pageable pageable) {
        return roadmapRepository.findByUserId(userId, pageable)
                .map(this::toRoadmapResponse);
    }

    public Page<RoadmapResponse> searchRoadmaps(String query, Pageable pageable) {
        return roadmapRepository.searchByTitleOrDescription(query, pageable)
                .map(this::toRoadmapResponse);
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
                .priority(request.priority() != null ? request.priority() : com.thadam.ai.roadmap.enums.TaskPriority.MEDIUM)
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
        if (request.status() != null) task.setStatus(request.status());
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

    public Page<CommunityRoadmapResponse> getCommunityRoadmaps(Pageable pageable, User currentUser) {
        return roadmapRepository.findAll(pageable)
                .map(roadmap -> {
                    long upvotes = voteRepository.countByRoadmapIdAndVoteType(roadmap.getId(), VoteType.UPVOTE);
                    long downvotes = voteRepository.countByRoadmapIdAndVoteType(roadmap.getId(), VoteType.DOWNVOTE);
                    Vote userVote = (currentUser != null)
                            ? voteRepository.findByUserIdAndRoadmapId(currentUser.getId(), roadmap.getId()).orElse(null)
                            : null;
                            int forkCount = (int) roadmapRepository.countByForkedFromId(roadmap.getId());
                    long msCount = milestoneRepository.countByRoadmapId(roadmap.getId());
                    long tCount = taskRepository.countByRoadmapId(roadmap.getId());

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
