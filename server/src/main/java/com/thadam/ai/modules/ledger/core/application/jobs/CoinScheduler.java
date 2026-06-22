package com.thadam.ai.modules.ledger.core.application.jobs;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CoinScheduler {

    private static final Logger log = LoggerFactory.getLogger(CoinScheduler.class);
    
    private final UserRepository userRepository;

    /**
     * Runs every day at midnight (00:00:00) server time.
     * Grants 10 coins to every user in the system.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void grantDailyCoins() {
        log.info("DAILY_COIN_GRANT_STARTED - Running daily 10 coin grant job...");
        long startTime = System.currentTimeMillis();
        
        try {
            int updatedUsers = userRepository.grantDailyCoinsToAllUsers();
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("DAILY_COIN_GRANT_COMPLETED - Successfully granted 10 coins to {} users in {}ms", 
                    updatedUsers, duration);
        } catch (Exception e) {
            log.error("DAILY_COIN_GRANT_FAILED - Failed to execute the daily coin grant job", e);
        }
    }
}
