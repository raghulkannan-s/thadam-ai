package com.thadam.ai.ledger.dto;

import java.time.LocalDateTime;

import com.thadam.ai.ledger.enums.TransactionType;

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
