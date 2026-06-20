package com.thadam.ai.modules.ledger.core.application.dtos;

import java.time.LocalDateTime;

import com.thadam.ai.modules.ledger.core.domain.enums.TransactionType;

public record CoinTransactionResponse(
    Long id,
    Long userId,
    int amount,
    int balanceAfter,
    TransactionType transactionType,
    String description,
    String referenceType,
    Long referenceId,
    LocalDateTime createdAt
) {}
