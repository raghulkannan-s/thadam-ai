package com.thadam.ai.modules.gamification.core.application.services;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;
import com.thadam.ai.modules.gamification.core.domain.entities.Achievement;
import com.thadam.ai.modules.gamification.core.domain.entities.LearningStreak;
import com.thadam.ai.modules.gamification.core.domain.entities.UserAchievement;
import com.thadam.ai.modules.gamification.core.domain.events.RoadmapViewedEvent;
import com.thadam.ai.modules.gamification.core.domain.events.TaskCompletedEvent;
import com.thadam.ai.modules.gamification.infrastructure.repositories.AchievementRepository;
import com.thadam.ai.modules.gamification.infrastructure.repositories.LearningStreakRepository;
import com.thadam.ai.modules.gamification.infrastructure.repositories.UserAchievementRepository;
import com.thadam.ai.modules.user.core.domain.entities.Notification;
import com.thadam.ai.modules.user.infrastructure.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionRequest;
import com.thadam.ai.modules.ledger.core.domain.enums.TransactionType;
import com.thadam.ai.modules.ledger.core.application.services.LedgerService;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {
    private final LearningStreakRepository streakRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final LedgerService ledgerService;

    @EventListener
    @Transactional
    public void handleTaskCompleted(TaskCompletedEvent event) {
        updateStreak(event.userId());
        checkAchievements(event.userId(), "TASK_COMPLETED");
    }

    @EventListener
    @Transactional
    public void handleRoadmapViewed(RoadmapViewedEvent event) {
        updateStreak(event.userId());
    }

    private void updateStreak(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        LearningStreak streak = streakRepository.findById(userId).orElseGet(() -> {
            LearningStreak s = new LearningStreak();
            s.setUser(user);
            s.setCurrentStreak(0);
            s.setLongestStreak(0);
            return s;
        });

        LocalDate today = LocalDate.now();
        LocalDate lastActivityDate = streak.getLastActivity() != null ? streak.getLastActivity().toLocalDate() : null;

        if (lastActivityDate == null || lastActivityDate.isBefore(today.minusDays(1))) {
            streak.setCurrentStreak(1);
        } else if (lastActivityDate.equals(today.minusDays(1))) {
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
            if (streak.getCurrentStreak() > streak.getLongestStreak()) {
                streak.setLongestStreak(streak.getCurrentStreak());
            }
        }
        
        streak.setLastActivity(LocalDateTime.now());
        streakRepository.save(streak);
        
        if (streak.getCurrentStreak() == 7) {
            checkAchievements(userId, "STREAK_7");
        }
    }

    private void checkAchievements(Long userId, String criteriaType) {
        // Mock achievement logic
        Achievement achievement = achievementRepository.findByName(criteriaType);
        if (achievement != null && !userAchievementRepository.existsByUserIdAndAchievementId(userId, achievement.getId())) {
            User user = userRepository.findById(userId).orElseThrow();
            UserAchievement ua = UserAchievement.builder().user(user).achievement(achievement).build();
            userAchievementRepository.save(ua);

            Notification notification = Notification.builder()
                .user(user)
                .type("ACHIEVEMENT_UNLOCKED")
                .message("You unlocked a new achievement: " + achievement.getName())
                .build();
            notificationRepository.save(notification);
        }
    }
}
