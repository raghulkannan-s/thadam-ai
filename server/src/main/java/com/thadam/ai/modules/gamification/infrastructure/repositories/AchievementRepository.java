package com.thadam.ai.modules.gamification.infrastructure.repositories;
import com.thadam.ai.modules.gamification.core.domain.entities.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Achievement findByName(String name);
}
