package com.thadam.ai.modules.auth.core.application.services;

import static org.assertj.core.api.Assertions.*;

import java.lang.reflect.Field;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.common.enums.Role;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        setField(jwtService, "secret", "test-secret-key-min-32-chars-long!!");
        setField(jwtService, "expiration", 3600000L);
    }

    private void setField(Object target, String name, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(name);
        field.setAccessible(true);
        field.set(target, value);
    }

    private User createUser(String email) {
        User user = User.builder()
                .name("Test User")
                .email(email)
                .role(Role.USER)
                .build();
        user.setId(1L);
        return user;
    }

    @Test
    void generateToken_shouldProduceValidToken() {
        User user = createUser("test@example.com");
        String token = jwtService.generateToken(user);

        assertThat(token).isNotNull().isNotEmpty();
        String extractedEmail = jwtService.extractEmail(token);
        assertThat(extractedEmail).isEqualTo("test@example.com");
    }

    @Test
    void isTokenValid_shouldReturnTrueForMatchingUser() {
        User user = createUser("valid@example.com");
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void isTokenValid_shouldReturnFalseForWrongUser() {
        User user = createUser("correct@example.com");
        User other = createUser("other@example.com");
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, other)).isFalse();
    }

    @Test
    void extractEmail_shouldReturnSubject() {
        User user = createUser("extract@example.com");
        String token = jwtService.generateToken(user);

        assertThat(jwtService.extractEmail(token)).isEqualTo("extract@example.com");
    }

    @Test
    void isTokenExpired_shouldReturnFalseForFreshToken() {
        User user = createUser("fresh@example.com");
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenExpired(token)).isFalse();
    }
}
