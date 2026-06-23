package com.thadam.ai.modules.roadmap.infrastructure.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

import com.thadam.ai.modules.roadmap.core.domain.entities.Roadmap;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {

    java.util.Optional<Roadmap> findByPublicId(String publicId);

    Page<Roadmap> findByUserId(Long userId, Pageable pageable);

    Page<Roadmap> findByUserIdAndVisibility(Long userId, RoadmapVisibility visibility, Pageable pageable);

    Page<Roadmap> findByStatus(RoadmapStatus status, Pageable pageable);

    List<Roadmap> findByVisibility(RoadmapVisibility visibility);

    @Query("SELECT r FROM Roadmap r JOIN FETCH r.user WHERE r.visibility = com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility.PUBLIC ORDER BY r.popularityScore DESC")
    Page<Roadmap> findTrending(Pageable pageable);

    @Query("SELECT r FROM Roadmap r JOIN FETCH r.user WHERE r.visibility = com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility.PUBLIC ORDER BY r.createdAt DESC")
    Page<Roadmap> findNewest(Pageable pageable);

    Page<Roadmap> findByUserIdInAndVisibility(List<Long> userIds, RoadmapVisibility visibility, Pageable pageable);

    @Query("SELECT r FROM Roadmap r WHERE r.visibility = com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility.PUBLIC AND (LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Roadmap> searchByTitleOrDescription(String search, Pageable pageable);

    long countByUserId(Long userId);

    long countByForkedFromId(Long forkedFromId);

    boolean existsByForkedFromIdAndUserId(Long forkedFromId, Long userId);

    long countByUserIdAndForkedFromIsNotNull(Long userId);

    @Query("SELECT r.forkedFrom.id, COUNT(r) FROM Roadmap r WHERE r.forkedFrom.id IN :roadmapIds GROUP BY r.forkedFrom.id")
    java.util.List<Object[]> countForksByRoadmapIdIn(@org.springframework.data.repository.query.Param("roadmapIds") java.util.List<Long> roadmapIds);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Roadmap r SET r.viewCount = r.viewCount + 1 WHERE r.id = :id")
    void incrementViewCount(@org.springframework.data.repository.query.Param("id") Long id);
}
