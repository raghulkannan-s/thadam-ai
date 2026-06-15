package com.thadam.ai.roadmap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thadam.ai.roadmap.entity.Milestone;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByRoadmapIdOrderByOrderIndexAsc(Long roadmapId);

    long countByRoadmapId(Long roadmapId);
}
