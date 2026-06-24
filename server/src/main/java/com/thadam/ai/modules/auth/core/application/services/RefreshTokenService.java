package com.thadam.ai.modules.auth.core.application.services;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.modules.auth.core.domain.entities.RefreshToken;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.repositories.RefreshTokenRepository;
import com.thadam.ai.common.exception.ConflictException;
import com.thadam.ai.common.exception.UnauthorizedException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpiration;

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString())
                .user(user)
                .expiryDate(toLocalDateTime(Instant.now().plusMillis(refreshExpiration)))
                .rotationVersion(0)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token expired. Please login again.");
        }
        return token;
    }

    @Transactional
    public RefreshToken rotateRefreshToken(String tokenValue) {
        RefreshToken token = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (token.isRevoked()) {
            deleteByUser(token.getUser());
            throw new ConflictException("Refresh token reuse detected. All tokens revoked for security.");
        }

        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token expired. Please login again.");
        }

        // Revoke the old token value to prevent reuse if captured (True RTR)
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        // Create a new token for the user
        RefreshToken newToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString())
                .user(token.getUser())
                .expiryDate(toLocalDateTime(Instant.now().plusMillis(refreshExpiration)))
                .rotationVersion(token.getRotationVersion() + 1)
                .build();
        
        return refreshTokenRepository.save(newToken);
    }

    @Transactional
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
}
