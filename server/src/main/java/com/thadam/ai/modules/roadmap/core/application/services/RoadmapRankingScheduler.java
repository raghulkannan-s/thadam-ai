package com.thadam.ai.modules.roadmap.core.application.services;

import com.thadam.ai.modules.roadmap.core.domain.entities.Roadmap;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.RoadmapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoadmapRankingScheduler {

    private final RoadmapRepository roadmapRepository;

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void recalculatePopularityScores() {
        log.info("Starting Roadmap Popularity Score Recalculation");
        List<Roadmap> publicRoadmaps = roadmapRepository.findByVisibility(RoadmapVisibility.PUBLIC);
        
        LocalDateTime now = LocalDateTime.now();

        for (Roadmap r : publicRoadmaps) {
            long hoursSinceCreation = Duration.between(r.getCreatedAt(), now).toHours();
            // Avoid division by zero
            hoursSinceCreation = Math.max(1, hoursSinceCreation);

            // Base weights
            double viewWeight = 0.1;
            double forkWeight = 2.0;
            double voteWeight = 1.0;
            double completionWeight = 3.0;

            double rawScore = (r.getViewCount() * viewWeight) +
                              (r.getForkCount() * forkWeight) +
                              (r.getVoteScore() * voteWeight) +
                              (r.getCompletionCount() * completionWeight);

            // Freshness decay: Score halves roughly every 7 days (168 hours)
            double decayFactor = Math.exp(-0.004 * hoursSinceCreation);

            double popularityScore = rawScore * decayFactor;
            
            r.setPopularityScore(popularityScore);
        }

        roadmapRepository.saveAll(publicRoadmaps);
        log.info("Finished updating scores for {} public roadmaps", publicRoadmaps.size());
    }
}
