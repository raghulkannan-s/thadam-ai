package com.thadam.ai.modules.community.core.application.services;

import com.thadam.ai.common.exception.ForbiddenException;
import com.thadam.ai.common.exception.NotFoundException;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.community.core.application.dtos.CollectionRequest;
import com.thadam.ai.modules.community.core.application.dtos.CollectionResponse;
import com.thadam.ai.modules.community.core.domain.entities.Collection;
import com.thadam.ai.modules.community.core.domain.entities.CollectionRoadmap;
import com.thadam.ai.modules.community.infrastructure.repositories.CollectionRepository;
import com.thadam.ai.modules.community.infrastructure.repositories.CollectionRoadmapRepository;
import com.thadam.ai.modules.roadmap.core.domain.entities.Roadmap;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.RoadmapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final CollectionRoadmapRepository collectionRoadmapRepository;
    private final RoadmapRepository roadmapRepository;

    @Transactional
    public CollectionResponse createCollection(CollectionRequest request, User user) {
        Collection collection = Collection.builder()
                .title(request.title())
                .description(request.description())
                .visibility(request.visibility() != null ? request.visibility() : "PUBLIC")
                .user(user)
                .build();
        Collection saved = collectionRepository.save(collection);
        return toResponse(saved);
    }

    public Page<CollectionResponse> getMyCollections(User user, Pageable pageable) {
        return collectionRepository.findByUserId(user.getId(), pageable).map(this::toResponse);
    }

    @Transactional
    public CollectionResponse updateCollection(Long id, CollectionRequest request, User user) {
        Collection collection = collectionRepository.findById(id).orElseThrow(() -> new NotFoundException("Collection not found"));
        if (!collection.getUser().getId().equals(user.getId())) throw new ForbiddenException("Not your collection");
        
        if (request.title() != null) collection.setTitle(request.title());
        if (request.description() != null) collection.setDescription(request.description());
        if (request.visibility() != null) collection.setVisibility(request.visibility());
        
        return toResponse(collectionRepository.save(collection));
    }

    @Transactional
    public void deleteCollection(Long id, User user) {
        Collection collection = collectionRepository.findById(id).orElseThrow(() -> new NotFoundException("Collection not found"));
        if (!collection.getUser().getId().equals(user.getId())) throw new ForbiddenException("Not your collection");
        collectionRepository.delete(collection);
    }

    @Transactional
    public void addRoadmapToCollection(Long collectionId, Long roadmapId, User user) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow();
        if (!collection.getUser().getId().equals(user.getId())) throw new ForbiddenException("Not your collection");
        
        Roadmap roadmap = roadmapRepository.findById(roadmapId).orElseThrow();
        
        CollectionRoadmap cr = CollectionRoadmap.builder()
                .collection(collection)
                .roadmap(roadmap)
                .orderIndex(0)
                .build();
        collectionRoadmapRepository.save(cr);
    }

    @Transactional
    public void removeRoadmapFromCollection(Long collectionId, Long roadmapId, User user) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow();
        if (!collection.getUser().getId().equals(user.getId())) throw new ForbiddenException("Not your collection");
        collectionRoadmapRepository.deleteByCollectionIdAndRoadmapId(collectionId, roadmapId);
    }

    private CollectionResponse toResponse(Collection c) {
        return new CollectionResponse(c.getId(), c.getTitle(), c.getDescription(), c.getVisibility(), c.getUser().getId(), c.getCreatedAt(), c.getUpdatedAt());
    }
}
