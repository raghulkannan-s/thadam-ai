package com.thadam.ai.modules.roadmap.core.application.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapGenerationRequest;

import lombok.RequiredArgsConstructor;

@Service
public class RoadmapAsyncWorker {

    private static final Logger log = LoggerFactory.getLogger(RoadmapAsyncWorker.class);

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private RoadmapGenerationService roadmapGenerationService;

    @Async
    public void executeGenerationAsync(Long roadmapId, RoadmapGenerationRequest request, User user, String correlationId) {
        if (correlationId != null) {
            MDC.put("correlationId", correlationId);
        }
        MDC.put("userId", String.valueOf(user.getId()));
        
        try {
            roadmapGenerationService.processAsyncGeneration(roadmapId, request, user);
        } catch (Exception e) {
            log.error("Async roadmap generation failed for roadmapId {}", roadmapId, e);
        } finally {
            MDC.clear();
        }
    }
}
