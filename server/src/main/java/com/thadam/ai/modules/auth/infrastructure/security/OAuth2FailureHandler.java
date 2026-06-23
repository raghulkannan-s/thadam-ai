package com.thadam.ai.modules.auth.infrastructure.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2FailureHandler.class);

    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${app.oauth2.frontend-redirect:http://localhost:3000/oauth2/redirect}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {

        String errorMessage = exception.getMessage();
        String errorCode = "oauth_error";

        if (errorMessage != null) {
            if (errorMessage.contains("invalid_client")) {
                errorCode = "invalid_client";
            } else if (errorMessage.contains("redirect_uri_mismatch")) {
                errorCode = "redirect_uri_mismatch";
            } else if (errorMessage.contains("consent_denied") || errorMessage.contains("access_denied")) {
                errorCode = "consent_denied";
            } else if (errorMessage.contains("unavailable") || errorMessage.contains("timeout")) {
                errorCode = "provider_unavailable";
            }
        }

        log.warn("OAUTH_LOGIN_FAILURE errorCode={} message={} correlationId={}",
                errorCode, errorMessage != null ? errorMessage : "unknown", MDC.get("correlationId"));

        String redirectUrl = frontendRedirectUrl + "?error=" + errorCode;
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
