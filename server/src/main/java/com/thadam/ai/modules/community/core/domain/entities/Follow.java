package com.thadam.ai.modules.community.core.domain.entities;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "follows")
@IdClass(Follow.FollowId.class)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Follow {
    
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class FollowId implements Serializable {
        private Long follower;
        private Long following;
    }

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
