package com.thadam.ai.modules.auth.core.application.services;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.thadam.ai.modules.auth.core.application.dtos.LoginRequest;
import com.thadam.ai.modules.auth.core.application.dtos.RegisterRequest;
import com.thadam.ai.modules.auth.core.domain.entities.RefreshToken;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.enums.Role;
import com.thadam.ai.common.exception.ConflictException;
import com.thadam.ai.common.exception.UnauthorizedException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_shouldThrowWhenEmailExists() {
        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest("Test", "existing@test.com", "password");

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Email already Exists");
    }

    @Test
    void login_shouldThrowWhenUserNotFound() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("missing@test.com", "password");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid Credentials");
    }

    @Test
    void login_shouldThrowWhenPasswordInvalid() {
        User user = User.builder()
                .email("test@test.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        LoginRequest request = new LoginRequest("test@test.com", "wrong-password");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid Credentials");
    }

    @Test
    void login_shouldReturnTokensWhenCredentialsValid() {
        User user = User.builder()
                .name("Test")
                .email("test@test.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();
        user.setId(1L);

        RefreshToken refreshToken = RefreshToken.builder()
                .token("refresh-token-value")
                .user(user)
                .build();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-password", "encoded-password")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("access-token-value");
        when(refreshTokenService.createRefreshToken(user)).thenReturn(refreshToken);

        var response = authService.login(new LoginRequest("test@test.com", "correct-password"));

        assertThat(response.accessToken()).isEqualTo("access-token-value");
        assertThat(response.refreshToken()).isEqualTo("refresh-token-value");
    }
}
