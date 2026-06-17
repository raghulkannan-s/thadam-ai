package com.thadam.ai.modules.community.core.domain.entities;

import com.thadam.ai.modules.roadmap.core.domain.entities.Roadmap;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "collection_roadmaps")
@IdClass(CollectionRoadmap.CollectionRoadmapId.class)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CollectionRoadmap {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CollectionRoadmapId implements Serializable {
        private Long collection;
        private Long roadmap;
    }

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_id", nullable = false)
    private Collection collection;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;
}
