package com.thadam.ai.roadmap.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.thadam.ai.roadmap.entity.Vote;
import com.thadam.ai.roadmap.enums.VoteType;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndRoadmapId(Long userId, Long roadmapId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.roadmap.id = :roadmapId AND v.voteType = :voteType")
    long countByRoadmapIdAndVoteType(Long roadmapId, VoteType voteType);

    void deleteByUserIdAndRoadmapId(Long userId, Long roadmapId);
}
