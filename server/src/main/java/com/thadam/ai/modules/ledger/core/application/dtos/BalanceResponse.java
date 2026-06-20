package com.thadam.ai.modules.ledger.core.application.dtos;

public record BalanceResponse(
    Long userId,
    int balance
) {}
