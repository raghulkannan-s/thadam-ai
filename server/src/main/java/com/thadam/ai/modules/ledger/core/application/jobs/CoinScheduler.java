package com.thadam.ai.modules.ledger.core.application.jobs;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;
import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionRequest;
import com.thadam.ai.modules.ledger.core.domain.enums.TransactionType;
import com.thadam.ai.modules.ledger.core.application.services.LedgerService;
import com.thadam.ai.common.enums.SubscriptionPlan;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CoinScheduler {

    private static final Logger log = LoggerFactory.getLogger(CoinScheduler.class);
    
    private final UserRepository userRepository;
    private final LedgerService ledgerService;

    /**
     * Runs every day at midnight (00:00:00) server time.
     * Grants 100 coins to PREMIUM users, 10 coins to FREE users.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void grantDailyCoins() {
        log.info("DAILY_COIN_GRANT_STARTED - Running daily coin grant job...");
        long startTime = System.currentTimeMillis();
        
        try {
            java.util.List<User> users = userRepository.findAll();
            for (User user : users) {
                int amount = user.getPlan() == SubscriptionPlan.PREMIUM ? 100 : 10;
                ledgerService.addTransaction(user, new CoinTransactionRequest(
                        amount,
                        TransactionType.EARNED,
                        "Daily Allowance",
                        "DAILY_REWARD",
                        null
                ));
            }
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("DAILY_COIN_GRANT_COMPLETED - Successfully granted coins to {} users in {}ms", 
                    users.size(), duration);
        } catch (Exception e) {
            log.error("DAILY_COIN_GRANT_FAILED - Failed to execute the daily coin grant job", e);
        }
    }
}
