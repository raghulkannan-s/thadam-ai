package com.thadam.ai.modules.community.core.domain.entities;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "collections")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Collection extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private String visibility = "PUBLIC";
}
