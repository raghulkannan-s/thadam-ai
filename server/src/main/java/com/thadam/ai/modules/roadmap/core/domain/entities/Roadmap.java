package com.thadam.ai.modules.roadmap.core.domain.entities;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.common.entity.BaseEntity;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roadmaps")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Roadmap extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoadmapStatus status = RoadmapStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forked_from_id")
    private Roadmap forkedFrom;

    @Column(nullable = false)
    @Builder.Default
    private String visibility = "PUBLIC";

    @Column(name = "popularity_score", nullable = false)
    @Builder.Default
    private Double popularityScore = 0.0;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "fork_count", nullable = false)
    @Builder.Default
    private Long forkCount = 0L;

    @Column(name = "vote_score", nullable = false)
    @Builder.Default
    private Long voteScore = 0L;

    @Column(name = "completion_count", nullable = false)
    @Builder.Default
    private Long completionCount = 0L;
}
