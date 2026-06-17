package com.thadam.ai.modules.community.core.domain.entities;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.roadmap.core.domain.entities.Roadmap;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "roadmap_forks")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RoadmapFork {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_roadmap_id", nullable = false)
    private Roadmap originalRoadmap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_roadmap_id", nullable = false)
    private Roadmap newRoadmap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forked_by_user_id", nullable = false)
    private User forkedBy;

    @CreationTimestamp
    @Column(name = "forked_at", nullable = false, updatable = false)
    private LocalDateTime forkedAt;
}
