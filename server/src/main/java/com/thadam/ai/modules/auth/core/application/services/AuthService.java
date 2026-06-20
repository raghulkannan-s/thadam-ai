package com.thadam.ai.modules.auth.core.application.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.modules.auth.core.application.dtos.LoginRequest;
import com.thadam.ai.modules.auth.core.application.dtos.LoginResponse;
import com.thadam.ai.modules.auth.core.application.dtos.OAuthCodeRequest;
import com.thadam.ai.modules.auth.core.application.dtos.RefreshTokenRequest;
import com.thadam.ai.modules.auth.core.application.dtos.RegisterRequest;
import com.thadam.ai.modules.auth.core.application.dtos.RegisterResponse;
import com.thadam.ai.modules.auth.core.domain.entities.RefreshToken;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.core.domain.events.UserRegisteredEvent;
import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.enums.AuthProvider;
import com.thadam.ai.common.enums.Role;
import com.thadam.ai.common.exception.ConflictException;
import com.thadam.ai.common.exception.UnauthorizedException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final OAuthCodeService oAuthCodeService;
    private final ApplicationEventPublisher eventPublisher;
    private final AuditService auditService;

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            log.warn("REGISTER_FAILURE email={} reason=email_exists correlationId={}",
                    request.email(), MDC.get("correlationId"));
            throw new ConflictException("Email already Exists");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .provider(AuthProvider.LOCAL)
                .build();

        User savedUser = userRepository.save(user);

        String accessToken = jwtService.generateToken(savedUser);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

        eventPublisher.publishEvent(new UserRegisteredEvent(savedUser));

        log.info("REGISTER_SUCCESS userId={} email={} correlationId={}",
                savedUser.getId(), savedUser.getEmail(), MDC.get("correlationId"));
        auditService.userRegistered(savedUser.getId(), savedUser.getEmail());

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                accessToken,
                refreshToken.getToken());
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    log.warn("LOGIN_FAILURE email={} reason=user_not_found correlationId={}",
                            request.email(), MDC.get("correlationId"));
                    return new UnauthorizedException("Invalid Credentials");
                });

        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            log.warn("LOGIN_FAILURE userId={} email={} reason=oauth_account correlationId={}",
                    user.getId(), user.getEmail(), MDC.get("correlationId"));
            throw new UnauthorizedException("This account uses Google sign in. Please use the Google button.");
        }

        boolean isValid = passwordEncoder.matches(request.password(), user.getPassword());

        if (!isValid) {
            log.warn("LOGIN_FAILURE userId={} email={} reason=invalid_password correlationId={}",
                    user.getId(), user.getEmail(), MDC.get("correlationId"));
            throw new UnauthorizedException("Invalid Credentials");
        }

        MDC.put("userId", String.valueOf(user.getId()));
        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        log.info("LOGIN_SUCCESS userId={} email={} correlationId={}",
                user.getId(), user.getEmail(), MDC.get("correlationId"));

        return new LoginResponse(accessToken, refreshToken.getToken());
    }

    @Transactional
    public LoginResponse refresh(RefreshTokenRequest request) {
        try {
            MDC.put("correlationId", MDC.get("correlationId"));
            RefreshToken newToken = refreshTokenService.rotateRefreshToken(request.refreshToken());
            User user = newToken.getUser();
            MDC.put("userId", String.valueOf(user.getId()));
            String accessToken = jwtService.generateToken(user);

            log.info("REFRESH_TOKEN userId={} correlationId={}",
                    user.getId(), MDC.get("correlationId"));
            auditService.tokenRefresh(user.getId());

            return new LoginResponse(accessToken, newToken.getToken());
        } finally {
            MDC.remove("userId");
        }
    }

    @Transactional
    public void logout(User user) {
        refreshTokenService.deleteByUser(user);
        log.info("LOGOUT userId={} email={} correlationId={}",
                user.getId(), user.getEmail(), MDC.get("correlationId"));
    }

    public LoginResponse exchangeOAuthCode(OAuthCodeRequest request) {
        OAuthCodeService.OAuthCode oAuthCode = oAuthCodeService.exchangeCode(request.code());
        log.info("OAUTH_CODE_EXCHANGE_SUCCESS correlationId={}", MDC.get("correlationId"));
        return new LoginResponse(oAuthCode.accessToken(), oAuthCode.refreshToken());
    }
}
