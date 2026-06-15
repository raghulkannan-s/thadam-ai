package com.thadam.ai.auth.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.auth.entity.RefreshToken;
import com.thadam.ai.auth.entity.User;
import com.thadam.ai.auth.repository.UserRepository;
import com.thadam.ai.auth.service.JwtService;
import com.thadam.ai.auth.service.RefreshTokenService;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.enums.AuthProvider;
import com.thadam.ai.common.enums.Role;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuditService auditService;

    @Value("${app.oauth2.frontend-redirect:http://localhost:3000/oauth2/redirect}")
    private String frontendRedirectUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = oauthToken.getPrincipal();
        Map<String, Object> attributes = oauth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String providerId = (String) attributes.get("sub");

        log.info("OAUTH_LOGIN_ATTEMPT email={} provider=google correlationId={}",
                email, MDC.get("correlationId"));

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .name(name)
                    .email(email)
                    .password("")
                    .role(Role.USER)
                    .provider(AuthProvider.GOOGLE)
                    .providerId(providerId)
                    .build();
            User saved = userRepository.save(newUser);
            log.info("OAUTH_USER_CREATED userId={} email={} correlationId={}",
                    saved.getId(), email, MDC.get("correlationId"));
            return saved;
        });

        if (user.getProvider() == AuthProvider.LOCAL) {
            user.setProvider(AuthProvider.GOOGLE);
            user.setProviderId(providerId);
            user = userRepository.save(user);
            log.info("OAUTH_LINK_ACCOUNT userId={} email={} provider=google correlationId={}",
                    user.getId(), email, MDC.get("correlationId"));
        }

        MDC.put("userId", String.valueOf(user.getId()));

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        log.info("OAUTH_LOGIN_SUCCESS userId={} email={} correlationId={}",
                user.getId(), email, MDC.get("correlationId"));
        auditService.oAuthLogin(user.getId(), email);

        String redirectUrl = frontendRedirectUrl
                + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                + "&refreshToken=" + URLEncoder.encode(refreshToken.getToken(), StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
