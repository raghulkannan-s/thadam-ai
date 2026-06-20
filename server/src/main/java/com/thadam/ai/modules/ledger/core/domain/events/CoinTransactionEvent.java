package com.thadam.ai.modules.ledger.core.domain.events;

import com.thadam.ai.common.event.DomainEvent;
import com.thadam.ai.modules.ledger.core.domain.entities.CoinTransaction;

import lombok.Getter;

@Getter
public class CoinTransactionEvent extends DomainEvent {

    private final Long transactionId;
    private final Long userId;
    private final int amount;
    private final int balanceAfter;
    private final String transactionType;

    public CoinTransactionEvent(CoinTransaction transaction) {
        this.transactionId = transaction.getId();
        this.userId = transaction.getUser().getId();
        this.amount = transaction.getAmount();
        this.balanceAfter = transaction.getBalanceAfter();
        this.transactionType = transaction.getTransactionType().name();
    }
}
