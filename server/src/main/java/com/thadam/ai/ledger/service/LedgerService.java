package com.thadam.ai.ledger.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.auth.entity.User;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.enums.Role;
import com.thadam.ai.common.exception.ForbiddenException;
import com.thadam.ai.common.exception.NotFoundException;
import com.thadam.ai.ledger.dto.BalanceResponse;
import com.thadam.ai.ledger.dto.CoinTransactionRequest;
import com.thadam.ai.ledger.dto.CoinTransactionResponse;
import com.thadam.ai.ledger.entity.CoinTransaction;
import com.thadam.ai.ledger.event.CoinTransactionEvent;
import com.thadam.ai.ledger.repository.CoinTransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LedgerService {

    private static final Logger log = LoggerFactory.getLogger(LedgerService.class);

    private final CoinTransactionRepository coinTransactionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final AuditService auditService;

    @Transactional
    public CoinTransactionResponse addTransaction(User user, CoinTransactionRequest request) {
        if (request.transactionType() == com.thadam.ai.ledger.enums.TransactionType.ADMIN_ADJUSTMENT
                && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only admins can use ADMIN_ADJUSTMENT");
        }
        int currentBalance = getCurrentBalance(user.getId());
        int signedAmount = switch (request.transactionType()) {
            case EARNED, REFUND, ADMIN_ADJUSTMENT -> request.amount();
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
        return coinTransactionRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .map(CoinTransaction::getBalanceAfter)
                .orElse(0);
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
