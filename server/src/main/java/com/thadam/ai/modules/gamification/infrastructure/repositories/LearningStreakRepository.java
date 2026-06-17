package com.thadam.ai.modules.gamification.infrastructure.repositories;
import com.thadam.ai.modules.gamification.core.domain.entities.LearningStreak;
import org.springframework.data.jpa.repository.JpaRepository;
public interface LearningStreakRepository extends JpaRepository<LearningStreak, Long> {}
