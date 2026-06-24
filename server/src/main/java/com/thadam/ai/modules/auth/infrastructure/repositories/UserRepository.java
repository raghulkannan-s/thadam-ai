package com.thadam.ai.modules.auth.infrastructure.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.thadam.ai.modules.auth.core.domain.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    Optional<User> findByPublicId(String publicId);

    Optional<User> findByStripeSubscriptionId(String stripeSubscriptionId);

    @Modifying
    @Query("UPDATE User u SET u.coins = u.coins + :amount WHERE u.id = :id AND (u.coins + :amount) >= 0")
    int updateCoinsAtomically(@Param("id") Long id, @Param("amount") int amount);
}
