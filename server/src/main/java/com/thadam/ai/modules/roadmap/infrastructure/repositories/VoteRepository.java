package com.thadam.ai.modules.roadmap.infrastructure.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.thadam.ai.modules.roadmap.core.domain.entities.Vote;
import com.thadam.ai.modules.roadmap.core.domain.enums.VoteType;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndRoadmapId(Long userId, Long roadmapId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.roadmap.id = :roadmapId AND v.voteType = :voteType")
    long countByRoadmapIdAndVoteType(Long roadmapId, VoteType voteType);

    @Query("SELECT v.roadmap.id, COUNT(v) FROM Vote v WHERE v.roadmap.id IN :roadmapIds AND v.voteType = :voteType GROUP BY v.roadmap.id")
    java.util.List<Object[]> countVotesByRoadmapIdsAndType(@org.springframework.data.repository.query.Param("roadmapIds") java.util.List<Long> roadmapIds, @org.springframework.data.repository.query.Param("voteType") VoteType voteType);

    java.util.List<Vote> findByUserIdAndRoadmapIdIn(Long userId, java.util.List<Long> roadmapIds);

    void deleteByUserIdAndRoadmapId(Long userId, Long roadmapId);
}
