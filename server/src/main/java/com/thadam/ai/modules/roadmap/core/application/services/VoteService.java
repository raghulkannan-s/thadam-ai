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
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility;
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
    public VoteResponse vote(String publicId, VoteRequest request, User user) {
        Roadmap roadmap = roadmapRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + publicId));

        if (roadmap.getVisibility() != RoadmapVisibility.PUBLIC) {
            throw new com.thadam.ai.common.exception.ForbiddenException("You can only vote on PUBLIC roadmaps");
        }

        if (roadmap.getUser().getId().equals(user.getId())) {
            throw new com.thadam.ai.common.exception.ForbiddenException("You cannot vote on your own roadmap");
        }

        Vote existing = voteRepository.findByUserIdAndRoadmapId(user.getId(), roadmap.getId()).orElse(null);

        String action;
        if (existing != null) {
            if (existing.getVoteType() == request.voteType()) {
                voteRepository.delete(existing);
                action = "REMOVED_" + request.voteType();
                log.info("VOTE_REMOVED userId={} roadmapId={} voteType={} correlationId={}",
                        user.getId(), roadmap.getId(), request.voteType(), MDC.get("correlationId"));
                updateRoadmapScores(roadmap);
                return buildResponse(null, roadmap.getId(), publicId);
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
                user.getId(), roadmap.getId(), action, MDC.get("correlationId"));
        auditService.communityAction(action, roadmap.getId(), user.getId());

        updateRoadmapScores(roadmap);

        Vote updated = voteRepository.findByUserIdAndRoadmapId(user.getId(), roadmap.getId()).orElse(null);
        return buildResponse(updated, roadmap.getId(), publicId);
    }

    private void updateRoadmapScores(Roadmap roadmap) {
        long upvotes = voteRepository.countByRoadmapIdAndVoteType(roadmap.getId(), VoteType.UPVOTE);
        long downvotes = voteRepository.countByRoadmapIdAndVoteType(roadmap.getId(), VoteType.DOWNVOTE);
        long voteScore = upvotes - downvotes;
        roadmap.setVoteScore(voteScore);
        
        double popularityScore = roadmap.getViewCount() + (voteScore * 10.0) + (roadmap.getForkCount() * 5.0) + (roadmap.getCompletionCount() * 20.0);
        roadmap.setPopularityScore(popularityScore);
        
        roadmapRepository.save(roadmap);
    }

    public VoteResponse getUserVote(String publicId, User user) {
        Roadmap roadmap = roadmapRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found with id: " + publicId));
        Vote vote = voteRepository.findByUserIdAndRoadmapId(user.getId(), roadmap.getId()).orElse(null);
        return buildResponse(vote, roadmap.getId(), publicId);
    }

    public long getUpvoteCount(Long roadmapId) {
        return voteRepository.countByRoadmapIdAndVoteType(roadmapId, VoteType.UPVOTE);
    }

    public long getDownvoteCount(Long roadmapId) {
        return voteRepository.countByRoadmapIdAndVoteType(roadmapId, VoteType.DOWNVOTE);
    }

    private VoteResponse buildResponse(Vote vote, Long internalId, String publicId) {
        long upvotes = voteRepository.countByRoadmapIdAndVoteType(internalId, VoteType.UPVOTE);
        long downvotes = voteRepository.countByRoadmapIdAndVoteType(internalId, VoteType.DOWNVOTE);
        return new VoteResponse(
                vote != null ? vote.getId() : null,
                vote != null ? vote.getUser().getPublicId() : null,
                publicId,
                vote != null ? vote.getVoteType() : null,
                upvotes,
                downvotes);
    }
}
