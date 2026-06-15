package com.thadam.ai.common.filter;

import java.io.IOException;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(2)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    private static final Set<String> SENSITIVE_PARAMS = Set.of(
            "password", "accessToken", "refreshToken", "token", "secret", "apiKey");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();

        String method = requestWrapper.getMethod();
        String path = getSanitizedPath(requestWrapper);
        String query = sanitizeQueryString(requestWrapper.getQueryString());

        log.info("REQUEST {} {} {}", method, path, query != null ? "?" + query : "");

        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = responseWrapper.getStatus();
            String userId = MDC.get("userId");

            if (userId != null) {
                log.info("RESPONSE {} {} {} {}ms [user={}]", method, path, status, duration, userId);
            } else {
                log.info("RESPONSE {} {} {} {}ms", method, path, status, duration);
            }

            responseWrapper.copyBodyToResponse();
        }
    }

    private String getSanitizedPath(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path != null && path.contains("/api/auth/login")) {
            return path;
        }
        return path;
    }

    private String sanitizeQueryString(String query) {
        if (query == null) return null;
        StringBuilder sb = new StringBuilder();
        String[] pairs = query.split("&");
        for (int i = 0; i < pairs.length; i++) {
            String[] kv = pairs[i].split("=", 2);
            if (i > 0) sb.append("&");
            sb.append(kv[0]);
            if (kv.length > 1) {
                if (SENSITIVE_PARAMS.contains(kv[0].toLowerCase())) {
                    sb.append("=***");
                } else {
                    sb.append("=").append(kv[1]);
                }
            }
        }
        return sb.toString();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator/health") || path.startsWith("/actuator/info");
    }
}
