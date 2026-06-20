package com.thadam.ai.modules.auth.core.application.services;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import com.thadam.ai.common.exception.UnauthorizedException;

@Service
public class OAuthCodeService {

    private static final Logger log = LoggerFactory.getLogger(OAuthCodeService.class);
    private static final long CODE_TTL_MS = 300_000;

    private final Map<String, OAuthCode> codes = new ConcurrentHashMap<>();

    public String generateCode(String accessToken, String refreshToken) {
        String code = UUID.randomUUID().toString().replace("-", "");
        OAuthCode payload = new OAuthCode(accessToken, refreshToken, Instant.now().plusMillis(CODE_TTL_MS));
        
        // Clean up expired codes periodically or lazily (lazy cleanup implemented in exchangeCode)
        codes.put(code, payload);
        
        log.info("OAUTH_CODE_GENERATED codeLength={} correlationId={}", code.length(), MDC.get("correlationId"));
        return code;
    }

    public OAuthCode exchangeCode(String code) {
        OAuthCode stored = codes.remove(code);
        
        if (stored == null) {
            log.warn("OAUTH_CODE_INVALID_OR_EXPIRED correlationId={}", MDC.get("correlationId"));
            throw new UnauthorizedException("Invalid or expired authentication code");
        }
        if (stored.expiresAt().isBefore(Instant.now())) {
            log.warn("OAUTH_CODE_EXPIRED correlationId={}", MDC.get("correlationId"));
            throw new UnauthorizedException("Authentication code expired. Please sign in again.");
        }
        
        log.info("OAUTH_CODE_EXCHANGED correlationId={}", MDC.get("correlationId"));
        return stored;
    }

    public record OAuthCode(String accessToken, String refreshToken, Instant expiresAt) {}
}
