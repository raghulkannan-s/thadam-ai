package com.thadam.ai.modules.auth.presentation.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thadam.ai.modules.auth.core.application.dtos.LoginRequest;
import com.thadam.ai.modules.auth.core.application.dtos.LoginResponse;
import com.thadam.ai.modules.auth.core.application.dtos.OAuthCodeRequest;
import com.thadam.ai.modules.auth.core.application.dtos.RefreshTokenRequest;
import com.thadam.ai.modules.auth.core.application.dtos.RegisterRequest;
import com.thadam.ai.modules.auth.core.application.dtos.RegisterResponse;
import com.thadam.ai.modules.auth.infrastructure.security.RefreshTokenCookieService;
import com.thadam.ai.modules.auth.core.application.services.AuthService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @Mock
    private RefreshTokenCookieService refreshTokenCookieService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void register_shouldReturn201() throws Exception {
        RegisterRequest request = new RegisterRequest("Test", "test@example.com", "password123");
        RegisterResponse response = new RegisterResponse(1L, "Test", "test@example.com", "access-token", "refresh-token");

        org.mockito.Mockito.when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist());

        org.mockito.Mockito.verify(refreshTokenCookieService)
                .addRefreshTokenCookie(any(), org.mockito.Mockito.eq("refresh-token"));
    }

    @Test
    void login_shouldReturnAccessTokenAndSetRefreshCookie() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        LoginResponse response = new LoginResponse("access-token", "refresh-token");

        org.mockito.Mockito.when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist());

        org.mockito.Mockito.verify(refreshTokenCookieService)
                .addRefreshTokenCookie(any(), org.mockito.Mockito.eq("refresh-token"));
    }

    @Test
    void refresh_shouldAcceptBodyFallbackAndRotateCookie() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("old-refresh-token");
        LoginResponse response = new LoginResponse("new-access-token", "new-refresh-token");

        org.mockito.Mockito.when(authService.refresh(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist());

        org.mockito.Mockito.verify(authService)
                .refresh(org.mockito.Mockito.argThat(arg -> "old-refresh-token".equals(arg.refreshToken())));
        org.mockito.Mockito.verify(refreshTokenCookieService)
                .addRefreshTokenCookie(any(), org.mockito.Mockito.eq("new-refresh-token"));
    }

    @Test
    void refresh_shouldPreferCookieRefreshToken() throws Exception {
        LoginResponse response = new LoginResponse("cookie-access-token", "cookie-refresh-token");

        org.mockito.Mockito.when(authService.refresh(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .cookie(new jakarta.servlet.http.Cookie(RefreshTokenCookieService.COOKIE_NAME, "cookie-old-token"))
                        .content(objectMapper.writeValueAsString(new RefreshTokenRequest("body-old-token"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("cookie-access-token"));

        org.mockito.Mockito.verify(authService)
                .refresh(org.mockito.Mockito.argThat(arg -> "cookie-old-token".equals(arg.refreshToken())));
    }

    @Test
    void exchangeOAuthCode_shouldReturnAccessTokenAndSetRefreshCookie() throws Exception {
        LoginResponse response = new LoginResponse("oauth-access-token", "oauth-refresh-token");

        org.mockito.Mockito.when(authService.exchangeOAuthCode(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/exchange-oauth-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new OAuthCodeRequest("oauth-code"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("oauth-access-token"))
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist());

        org.mockito.Mockito.verify(refreshTokenCookieService)
                .addRefreshTokenCookie(any(), org.mockito.Mockito.eq("oauth-refresh-token"));
    }

    @Test
    void logout_shouldClearRefreshCookieWhenAnonymous() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk());

        org.mockito.Mockito.verify(refreshTokenCookieService).clearRefreshTokenCookie(any());
    }

    @Test
    void register_shouldRejectInvalidEmail() throws Exception {
        RegisterRequest request = new RegisterRequest("Test", "not-an-email", "password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_shouldRejectMissingPassword() throws Exception {
        String body = """
                {"email": "test@example.com"}
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void me_shouldReturnWithoutError() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk());
    }
}
