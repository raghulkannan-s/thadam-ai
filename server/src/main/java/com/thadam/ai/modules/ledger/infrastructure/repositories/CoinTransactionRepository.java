package com.thadam.ai.modules.ledger.infrastructure.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.thadam.ai.modules.ledger.core.domain.entities.CoinTransaction;

public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, Long> {

    Page<CoinTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(CASE WHEN c.amount > 0 THEN c.amount ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN c.amount < 0 THEN ABS(c.amount) ELSE 0 END), 0) FROM CoinTransaction c WHERE c.user.id = :userId")
    Optional<Integer> getBalanceByUserId(Long userId);

    Optional<CoinTransaction> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndTransactionTypeAndReferenceTypeAndReferenceId(
        Long userId, 
        com.thadam.ai.modules.ledger.core.domain.enums.TransactionType transactionType, 
        String referenceType, 
        Long referenceId
    );
}
