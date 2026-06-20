package com.thadam.ai.modules.auth.infrastructure.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thadam.ai.modules.auth.core.domain.entities.RefreshToken;
import com.thadam.ai.modules.auth.core.domain.entities.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);
}
