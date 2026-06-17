package com.thadam.ai.modules.community.core.domain.entities;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "creator_profiles")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CreatorProfile {
    @Id
    @Column(name = "user_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String website;
    @Column(name = "github_url") private String githubUrl;
    @Column(name = "twitter_url") private String twitterUrl;

    @Column(name = "total_views", nullable = false) @Builder.Default private Long totalViews = 0L;
    @Column(name = "total_forks", nullable = false) @Builder.Default private Long totalForks = 0L;
    @Column(name = "total_votes", nullable = false) @Builder.Default private Long totalVotes = 0L;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
