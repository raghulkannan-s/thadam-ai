package com.thadam.ai.modules.community.infrastructure.repositories;
import com.thadam.ai.modules.community.core.domain.entities.CollectionRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CollectionRoadmapRepository extends JpaRepository<CollectionRoadmap, CollectionRoadmap.CollectionRoadmapId> {
    void deleteByCollectionIdAndRoadmapId(Long collectionId, Long roadmapId);
}
