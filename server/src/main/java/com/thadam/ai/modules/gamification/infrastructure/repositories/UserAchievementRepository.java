package com.thadam.ai.modules.gamification.infrastructure.repositories;
import com.thadam.ai.modules.gamification.core.domain.entities.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    boolean existsByUserIdAndAchievementId(Long userId, Long achievementId);
}
