package com.thadam.ai.modules.gamification.core.domain.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "achievements")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "badge_url")
    private String badgeUrl;

    @Column(name = "criteria_type", nullable = false, length = 50)
    private String criteriaType;

    @Column(nullable = false)
    private Integer threshold;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
