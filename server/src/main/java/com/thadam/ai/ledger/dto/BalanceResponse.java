package com.thadam.ai.ledger.dto;

public record BalanceResponse(
    Long userId,
    int balance
) {}
