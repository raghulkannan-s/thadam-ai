package com.thadam.ai.modules.ledger.core.application.dtos;

import com.thadam.ai.modules.ledger.core.domain.enums.TransactionType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CoinTransactionRequest(
    @NotNull @Positive int amount,
    @NotNull TransactionType transactionType,
    String description,
    String referenceType,
    Long referenceId
) {}
