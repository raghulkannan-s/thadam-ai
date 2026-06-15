package com.thadam.ai.auth.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.auth.entity.RefreshToken;
import com.thadam.ai.auth.entity.User;
import com.thadam.ai.auth.repository.RefreshTokenRepository;
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
    public RefreshToken rotateRefreshToken(String oldTokenValue) {
        RefreshToken oldToken = refreshTokenRepository.findByToken(oldTokenValue)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (oldToken.isRevoked()) {
            deleteByUser(oldToken.getUser());
            throw new ConflictException("Refresh token reuse detected. All tokens revoked for security.");
        }

        if (oldToken.isExpired()) {
            refreshTokenRepository.delete(oldToken);
            throw new UnauthorizedException("Refresh token expired. Please login again.");
        }

        oldToken.setRevoked(true);
        oldToken.setLastUsedAt(LocalDateTime.now());
        oldToken.setRotationVersion(oldToken.getRotationVersion() + 1);
        refreshTokenRepository.save(oldToken);

        RefreshToken newToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString())
                .user(oldToken.getUser())
                .expiryDate(toLocalDateTime(Instant.now().plusMillis(refreshExpiration)))
                .rotationVersion(oldToken.getRotationVersion())
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
