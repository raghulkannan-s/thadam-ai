package com.thadam.ai.modules.ledger.core.application.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.enums.Role;
import com.thadam.ai.common.exception.ForbiddenException;
import com.thadam.ai.common.exception.NotFoundException;
import com.thadam.ai.modules.ledger.core.application.dtos.BalanceResponse;
import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionRequest;
import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionResponse;
import com.thadam.ai.modules.ledger.core.domain.entities.CoinTransaction;
import com.thadam.ai.modules.ledger.core.domain.events.CoinTransactionEvent;
import com.thadam.ai.modules.ledger.infrastructure.repositories.CoinTransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LedgerService {

    private static final Logger log = LoggerFactory.getLogger(LedgerService.class);

    private final CoinTransactionRepository coinTransactionRepository;
    private final com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final AuditService auditService;

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public CoinTransactionResponse addTransaction(User user, CoinTransactionRequest request) {
        if (request.transactionType() == com.thadam.ai.modules.ledger.core.domain.enums.TransactionType.ADMIN_ADJUSTMENT
                && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only admins can use ADMIN_ADJUSTMENT");
        }
        int currentBalance = getCurrentBalance(user.getId());
        
        if (request.transactionType() == com.thadam.ai.modules.ledger.core.domain.enums.TransactionType.SPENT 
                && currentBalance < request.amount()) {
            throw new com.thadam.ai.common.exception.InsufficientCoinsException(
                    "Insufficient coins. Current balance: " + currentBalance + ", Required: " + request.amount());
        }

        int signedAmount = switch (request.transactionType()) {
            case EARNED, REFUND, ADMIN_ADJUSTMENT, PURCHASED -> request.amount();
            case SPENT -> -request.amount();
        };
        int balanceAfter = currentBalance + signedAmount;

        CoinTransaction transaction = CoinTransaction.builder()
                .user(user)
                .amount(signedAmount)
                .balanceAfter(balanceAfter)
                .transactionType(request.transactionType())
                .description(request.description())
                .referenceType(request.referenceType())
                .referenceId(request.referenceId())
                .createdAt(java.time.LocalDateTime.now())
                .build();

        user.setCoins(balanceAfter);
        userRepository.save(user);

        CoinTransaction saved = coinTransactionRepository.save(transaction);
        eventPublisher.publishEvent(new CoinTransactionEvent(saved));

        log.info("COIN_TRANSACTION transactionId={} userId={} amount={} type={} balanceAfter={} correlationId={}",
                saved.getId(), user.getId(), signedAmount, request.transactionType(), balanceAfter, MDC.get("correlationId"));
        auditService.coinTransaction(saved.getId(), user.getId(), (long) signedAmount, request.transactionType().name());

        return toResponse(saved);
    }

    public BalanceResponse getBalance(Long userId) {
        int balance = getCurrentBalance(userId);
        return new BalanceResponse(userId, balance);
    }

    public Page<CoinTransactionResponse> getTransactionHistory(Long userId, Pageable pageable) {
        return coinTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    public CoinTransactionResponse getTransactionById(Long id) {
        CoinTransaction transaction = coinTransactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transaction not found with id: " + id));
        return toResponse(transaction);
    }

    private int getCurrentBalance(Long userId) {
        return userRepository.findById(userId)
                .map(User::getCoins)
                .orElse(0);
    }

    public boolean hasEarnedCoinForReference(Long userId, String referenceType, Long referenceId) {
        return coinTransactionRepository.existsByUserIdAndTransactionTypeAndReferenceTypeAndReferenceId(
                userId, 
                com.thadam.ai.modules.ledger.core.domain.enums.TransactionType.EARNED, 
                referenceType, 
                referenceId
        );
    }

    private CoinTransactionResponse toResponse(CoinTransaction t) {
        return new CoinTransactionResponse(
                t.getId(),
                t.getUser().getId(),
                t.getAmount(),
                t.getBalanceAfter(),
                t.getTransactionType(),
                t.getDescription(),
                t.getReferenceType(),
                t.getReferenceId(),
                t.getCreatedAt());
    }
}
