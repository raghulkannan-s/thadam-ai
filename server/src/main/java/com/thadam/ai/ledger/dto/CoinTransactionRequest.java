package com.thadam.ai.ledger.dto;

import com.thadam.ai.ledger.enums.TransactionType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CoinTransactionRequest(
    @NotNull @Positive int amount,
    @NotNull TransactionType transactionType,
    String description,
    String referenceType,
    Long referenceId
) {}
