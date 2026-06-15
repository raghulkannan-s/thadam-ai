package com.thadam.ai.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.auth.dto.LoginRequest;
import com.thadam.ai.auth.dto.LoginResponse;
import com.thadam.ai.auth.dto.RefreshTokenRequest;
import com.thadam.ai.auth.dto.RegisterRequest;
import com.thadam.ai.auth.dto.RegisterResponse;
import com.thadam.ai.auth.entity.RefreshToken;
import com.thadam.ai.auth.entity.User;
import com.thadam.ai.auth.event.UserRegisteredEvent;
import com.thadam.ai.auth.repository.UserRepository;
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

        eventPublisher.publishEvent(new UserRegisteredEvent(savedUser));

        log.info("REGISTER_SUCCESS userId={} email={} correlationId={}",
                savedUser.getId(), savedUser.getEmail(), MDC.get("correlationId"));
        auditService.userRegistered(savedUser.getId(), savedUser.getEmail());

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail());
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    log.warn("LOGIN_FAILURE email={} reason=user_not_found correlationId={}",
                            request.email(), MDC.get("correlationId"));
                    return new UnauthorizedException("Invalid Credentials");
                });

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
        RefreshToken newToken = refreshTokenService.rotateRefreshToken(request.refreshToken());
        User user = newToken.getUser();
        MDC.put("userId", String.valueOf(user.getId()));
        String accessToken = jwtService.generateToken(user);

        log.info("REFRESH_TOKEN userId={} correlationId={}",
                user.getId(), MDC.get("correlationId"));
        auditService.tokenRefresh(user.getId());

        return new LoginResponse(accessToken, newToken.getToken());
    }

    @Transactional
    public void logout(User user) {
        refreshTokenService.deleteByUser(user);
        log.info("LOGOUT userId={} email={} correlationId={}",
                user.getId(), user.getEmail(), MDC.get("correlationId"));
    }
}
