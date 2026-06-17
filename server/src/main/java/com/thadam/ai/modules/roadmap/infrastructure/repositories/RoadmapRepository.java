package com.thadam.ai.modules.roadmap.infrastructure.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

import com.thadam.ai.modules.roadmap.core.domain.entities.Roadmap;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {

    Page<Roadmap> findByUserId(Long userId, Pageable pageable);

    Page<Roadmap> findByStatus(RoadmapStatus status, Pageable pageable);

    List<Roadmap> findByVisibility(String visibility);

    @Query("SELECT r FROM Roadmap r WHERE r.visibility = 'PUBLIC' ORDER BY r.popularityScore DESC")
    Page<Roadmap> findTrending(Pageable pageable);

    @Query("SELECT r FROM Roadmap r WHERE r.visibility = 'PUBLIC' ORDER BY r.createdAt DESC")
    Page<Roadmap> findNewest(Pageable pageable);

    Page<Roadmap> findByUserIdInAndVisibility(List<Long> userIds, String visibility, Pageable pageable);

    @Query("SELECT r FROM Roadmap r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Roadmap> searchByTitleOrDescription(String search, Pageable pageable);

    long countByUserId(Long userId);

    long countByForkedFromId(Long forkedFromId);

    @Query("SELECT r.forkedFrom.id, COUNT(r) FROM Roadmap r WHERE r.forkedFrom.id IN :roadmapIds GROUP BY r.forkedFrom.id")
    java.util.List<Object[]> countForksByRoadmapIdIn(@org.springframework.data.repository.query.Param("roadmapIds") java.util.List<Long> roadmapIds);
}
