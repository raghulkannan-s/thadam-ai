package com.thadam.ai.ledger.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class CoinTransactionListener {

    private static final Logger log = LoggerFactory.getLogger(CoinTransactionListener.class);

    @Async("domainEventExecutor")
    @EventListener
    public void handleCoinTransaction(CoinTransactionEvent event) {
        log.info("Coin transaction processed: user={}, amount={}, balance={}, type={}",
                event.getUserId(), event.getAmount(), event.getBalanceAfter(), event.getTransactionType());
    }
}
