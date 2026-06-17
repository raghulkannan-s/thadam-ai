package com.thadam.ai.modules.roadmap.infrastructure.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thadam.ai.modules.roadmap.core.domain.entities.Milestone;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByRoadmapIdOrderByOrderIndexAsc(Long roadmapId);

    long countByRoadmapId(Long roadmapId);

    @org.springframework.data.jpa.repository.Query("SELECT m.roadmap.id, COUNT(m) FROM Milestone m WHERE m.roadmap.id IN :roadmapIds GROUP BY m.roadmap.id")
    List<Object[]> countByRoadmapIdIn(@org.springframework.data.repository.query.Param("roadmapIds") List<Long> roadmapIds);
}
