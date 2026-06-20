package com.thadam.ai.common.filter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thadam.ai.common.dto.ApiResponse;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(1)
public class RateLimitingFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MILLIS = 60_000;

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    private static class Window {
        final AtomicInteger count = new AtomicInteger(0);
        final long start = System.currentTimeMillis();
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String path = request.getRequestURI();

        if (!path.equals("/api/auth/login") && !path.equals("/api/auth/register")) {
            chain.doFilter(request, response);
            return;
        }

        String key = request.getRemoteAddr();
        long now = System.currentTimeMillis();

        Window window = windows.compute(key, (k, existing) -> {
            if (existing == null || (now - existing.start) > WINDOW_MILLIS) {
                return new Window();
            }
            return existing;
        });

        if (window.count.incrementAndGet() > MAX_REQUESTS) {
            log.warn("RATE_LIMIT_EXCEEDED ip={} path={}", key, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            ApiResponse<Void> body = ApiResponse.error("Too many requests. Please try again later.");
            response.getWriter().write(mapper.writeValueAsString(body));
            return;
        }

        chain.doFilter(request, response);
    }
}
