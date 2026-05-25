package com.thadam.ai.filters;

import com.thadam.ai.dto.ApiResponse;
import com.thadam.ai.utils.JsonUtils;
import com.thadam.ai.utils.SessionUtils;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebFilter(filterName = "AuthFilter", urlPatterns = {"/api/roadmaps/*", "/api/tasks/*"})
public class AuthFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        if (SessionUtils.getUserId(req) == null) {
            JsonUtils.writeJson(res, HttpServletResponse.SC_UNAUTHORIZED, new ApiResponse<>(false, "Not authenticated", null));
            return;
        }
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}
