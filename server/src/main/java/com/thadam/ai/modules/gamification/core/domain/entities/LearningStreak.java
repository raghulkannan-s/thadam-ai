package com.thadam.ai.modules.gamification.core.domain.entities;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_streaks")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class LearningStreak {
    @Id
    @Column(name = "user_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "current_streak") @Builder.Default private Integer currentStreak = 0;
    @Column(name = "longest_streak") @Builder.Default private Integer longestStreak = 0;
    
    @Column(name = "last_activity")
    private LocalDateTime lastActivity;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
