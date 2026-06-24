package com.thadam.ai.modules.roadmap.core.domain.entities;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.common.entity.BaseEntity;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapCategory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.UUID;
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

    @Column(name = "public_id", unique = true, updatable = false)
    private String publicId;

    @Column(nullable = false)
    private String title;

    @Column(name = "short_title", length = 100)
    private String shortTitle;

    @PrePersist
    public void prePersist() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID().toString();
        }
    }

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoadmapVisibility visibility = RoadmapVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoadmapCategory category = RoadmapCategory.OTHER;

    @Column(nullable = false)
    @Builder.Default
    private String difficulty = "INTERMEDIATE";

    @Column(name = "duration_weeks", nullable = false)
    @Builder.Default
    private Integer durationWeeks = 4;

    @Column(name = "duration_type")
    @Builder.Default
    private String durationType = "WEEKS";

    @Column(name = "duration_value")
    @Builder.Default
    private Integer durationValue = 4;

    @Column(name = "estimated_hours_per_day", nullable = false)
    @Builder.Default
    private Double estimatedHoursPerDay = 1.0;

    @Column(name = "start_date")
    private java.time.LocalDateTime startDate;

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

    @Column(name = "comment_count", nullable = false)
    @Builder.Default
    private Integer commentCount = 0;

    @jakarta.persistence.OneToMany(mappedBy = "roadmap", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<Milestone> milestones = new java.util.ArrayList<>();

    @jakarta.persistence.OneToMany(mappedBy = "roadmap", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<Task> tasks = new java.util.ArrayList<>();
}
