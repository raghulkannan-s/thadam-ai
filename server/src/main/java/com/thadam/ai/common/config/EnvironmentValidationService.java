package com.thadam.ai.common.config;

import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class EnvironmentValidationService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(EnvironmentValidationService.class);

    private final Environment environment;
    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${app.cors.allowed-origins:}")
    private String allowedOrigins;

    public EnvironmentValidationService(
            Environment environment,
            JdbcTemplate jdbcTemplate) {
        this.environment = environment;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean strict = isStrictProfile();
        validateRequired("GOOGLE_CLIENT_ID", googleClientId, strict);
        validateRequired("GOOGLE_CLIENT_SECRET", googleClientSecret, strict);
        validateJwtSecret(strict);
        validateCors(strict);
        validateDatabase(strict);
    }

    private boolean isStrictProfile() {
        List<String> profiles = Arrays.asList(environment.getActiveProfiles());
        return profiles.contains("prod") || profiles.contains("production") || profiles.contains("staging");
    }

    private void validateRequired(String name, String value, boolean strict) {
        boolean missing = value == null || value.isBlank() || "placeholder".equalsIgnoreCase(value);
        if (!missing) {
            return;
        }
        String message = name + " is not configured";
        if (strict) {
            throw new IllegalStateException(message);
        }
        log.warn("ENV_VALIDATION_WARNING {}", message);
    }

    private void validateJwtSecret(boolean strict) {
        boolean weak = jwtSecret == null || jwtSecret.length() < 32;
        if (!weak) {
            return;
        }
        String message = "JWT_SECRET must be at least 32 characters";
        if (strict) {
            throw new IllegalStateException(message);
        }
        log.warn("ENV_VALIDATION_WARNING {}", message);
    }

    private void validateCors(boolean strict) {
        boolean invalid = allowedOrigins == null || allowedOrigins.isBlank() || allowedOrigins.contains("*");
        if (!invalid) {
            return;
        }
        String message = "CORS_ALLOWED_ORIGINS must be explicit";
        if (strict) {
            throw new IllegalStateException(message);
        }
        log.warn("ENV_VALIDATION_WARNING {}", message);
    }

    private void validateDatabase(boolean strict) {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        } catch (Exception e) {
            String message = "Database health check failed";
            if (strict) {
                throw new IllegalStateException(message, e);
            }
            log.warn("ENV_VALIDATION_WARNING {}", message);
        }
    }


}
