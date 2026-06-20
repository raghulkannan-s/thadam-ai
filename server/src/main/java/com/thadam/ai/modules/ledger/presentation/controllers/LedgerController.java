package com.thadam.ai.modules.ledger.presentation.controllers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.common.dto.ApiResponse;
import com.thadam.ai.modules.ledger.core.application.dtos.BalanceResponse;
import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionRequest;
import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionResponse;
import com.thadam.ai.modules.ledger.core.application.services.LedgerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<CoinTransactionResponse>> addTransaction(
            @Valid @RequestBody CoinTransactionRequest request,
            @AuthenticationPrincipal User user) {
        CoinTransactionResponse response = ledgerService.addTransaction(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<BalanceResponse>> getBalance(@AuthenticationPrincipal User user) {
        BalanceResponse balance = ledgerService.getBalance(user.getId());
        return ResponseEntity.ok(ApiResponse.success(balance));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/balance/{userId}")
    public ResponseEntity<ApiResponse<BalanceResponse>> getBalanceByAdmin(@PathVariable Long userId) {
        BalanceResponse balance = ledgerService.getBalance(userId);
        return ResponseEntity.ok(ApiResponse.success(balance));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<CoinTransactionResponse>>> getTransactionHistory(
            @AuthenticationPrincipal User user,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<CoinTransactionResponse> history = ledgerService.getTransactionHistory(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<CoinTransactionResponse>> getTransaction(@PathVariable Long id) {
        CoinTransactionResponse response = ledgerService.getTransactionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
