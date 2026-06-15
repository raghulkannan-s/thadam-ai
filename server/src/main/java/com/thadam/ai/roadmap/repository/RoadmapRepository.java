package com.thadam.ai.roadmap.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.thadam.ai.roadmap.entity.Roadmap;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {

    Page<Roadmap> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT r FROM Roadmap r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Roadmap> searchByTitleOrDescription(String search, Pageable pageable);

    long countByUserId(Long userId);

    long countByForkedFromId(Long forkedFromId);
}
