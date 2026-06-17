package com.thadam.ai.modules.roadmap.core.application.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.exception.NotFoundException;
import com.thadam.ai.modules.roadmap.core.application.dtos.VoteRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.VoteResponse;
import com.thadam.ai.modules.roadmap.core.domain.entities.Roadmap;
import com.thadam.ai.modules.roadmap.core.domain.entities.Vote;
import com.thadam.ai.modules.roadmap.core.domain.enums.VoteType;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.RoadmapRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.VoteRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class VoteService {

    private static final Logger log = LoggerFactory.getLogger(VoteService.class);

    private final VoteRepository voteRepository;
    private final RoadmapRepository roadmapRepository;
    private final AuditService auditService;

    @Transactional
    public VoteResponse vote(Long roadmapId, VoteRequest request, User user) {
        Roadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + roadmapId));

        Vote existing = voteRepository.findByUserIdAndRoadmapId(user.getId(), roadmapId).orElse(null);

        String action;
        if (existing != null) {
            if (existing.getVoteType() == request.voteType()) {
                voteRepository.delete(existing);
                action = "REMOVED_" + request.voteType();
                log.info("VOTE_REMOVED userId={} roadmapId={} voteType={} correlationId={}",
                        user.getId(), roadmapId, request.voteType(), MDC.get("correlationId"));
                return buildResponse(null, roadmapId);
            }
            existing.setVoteType(request.voteType());
            voteRepository.save(existing);
            action = "CHANGED_TO_" + request.voteType();
        } else {
            Vote vote = Vote.builder()
                    .user(user)
                    .roadmap(roadmap)
                    .voteType(request.voteType())
                    .build();
            voteRepository.save(vote);
            action = "CAST_" + request.voteType();
        }

        log.info("VOTE_CAST userId={} roadmapId={} action={} correlationId={}",
                user.getId(), roadmapId, action, MDC.get("correlationId"));
        auditService.communityAction(action, roadmapId, user.getId());

        Vote updated = voteRepository.findByUserIdAndRoadmapId(user.getId(), roadmapId).orElse(null);
        return buildResponse(updated, roadmapId);
    }

    public VoteResponse getUserVote(Long roadmapId, User user) {
        Vote vote = voteRepository.findByUserIdAndRoadmapId(user.getId(), roadmapId).orElse(null);
        return buildResponse(vote, roadmapId);
    }

    public long getUpvoteCount(Long roadmapId) {
        return voteRepository.countByRoadmapIdAndVoteType(roadmapId, VoteType.UPVOTE);
    }

    public long getDownvoteCount(Long roadmapId) {
        return voteRepository.countByRoadmapIdAndVoteType(roadmapId, VoteType.DOWNVOTE);
    }

    private VoteResponse buildResponse(Vote vote, Long roadmapId) {
        long upvotes = voteRepository.countByRoadmapIdAndVoteType(roadmapId, VoteType.UPVOTE);
        long downvotes = voteRepository.countByRoadmapIdAndVoteType(roadmapId, VoteType.DOWNVOTE);
        return new VoteResponse(
                vote != null ? vote.getId() : null,
                vote != null ? vote.getUser().getId() : null,
                roadmapId,
                vote != null ? vote.getVoteType() : null,
                upvotes,
                downvotes);
    }
}
