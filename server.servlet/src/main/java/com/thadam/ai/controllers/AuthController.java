package com.thadam.ai.controllers;

import com.thadam.ai.dto.ApiResponse;
import com.thadam.ai.dto.AuthResponseDto;
import com.thadam.ai.dto.UserDto;
import com.thadam.ai.services.AuthService;
import com.thadam.ai.utils.JsonUtils;
import com.thadam.ai.utils.SessionUtils;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet(name = "AuthController", urlPatterns = "/api/auth/*")
public class AuthController extends HttpServlet {
    private final AuthService authService = new AuthService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null || "/me".equals(path)) {
            Long userId = SessionUtils.getUserId(req);
            if (userId == null) {
                JsonUtils.writeJson(resp, HttpServletResponse.SC_UNAUTHORIZED, new ApiResponse<>(false, "Not authenticated", null));
                return;
            }
            try {
                UserDto user = authService.getUser(userId);
                if (user == null) {
                    JsonUtils.writeJson(resp, HttpServletResponse.SC_UNAUTHORIZED, new ApiResponse<>(false, "Not authenticated", null));
                    return;
                }
                JsonUtils.writeJson(resp, HttpServletResponse.SC_OK, new ApiResponse<>(true, "Authenticated", new AuthResponseDto(user)));
                return;
            } catch (Exception ex) {
                JsonUtils.writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, new ApiResponse<>(false, "Server error", null));
                return;
            }
        }
        JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
            return;
        }

        try {
            switch (path) {
                case "/register":
                    RegisterRequest register = JsonUtils.readJson(req, RegisterRequest.class);
                    if (register == null) {
                        JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, "Invalid request body", null));
                        break;
                    }
                    UserDto registered = authService.register(register.email, register.password, register.displayName);
                    setSession(req, registered.getId());
                    JsonUtils.writeJson(resp, HttpServletResponse.SC_CREATED, new ApiResponse<>(true, "Registration successful", new AuthResponseDto(registered)));
                    break;
                case "/login":
                    LoginRequest login = JsonUtils.readJson(req, LoginRequest.class);
                    if (login == null) {
                        JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, "Invalid request body", null));
                        break;
                    }
                    UserDto user = authService.login(login.email, login.password);
                    setSession(req, user.getId());
                    JsonUtils.writeJson(resp, HttpServletResponse.SC_OK, new ApiResponse<>(true, "Login successful", new AuthResponseDto(user)));
                    break;
                case "/logout":
                    HttpSession session = req.getSession(false);
                    if (session != null) {
                        session.invalidate();
                    }
                    JsonUtils.writeJson(resp, HttpServletResponse.SC_OK, new ApiResponse<>(true, "Logged out", null));
                    break;
                default:
                    JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
                    break;
            }
        } catch (IllegalArgumentException ex) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, ex.getMessage(), null));
        } catch (Exception ex) {
            ex.printStackTrace();
            JsonUtils.writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, new ApiResponse<>(false, "Server error: " + ex.getMessage(), null));
        }
    }

    private void setSession(HttpServletRequest req, long userId) {
        HttpSession session = req.getSession(true);
        session.setAttribute(SessionUtils.USER_ID, userId);
        session.setMaxInactiveInterval(60 * 60 * 4);
    }

    private static class RegisterRequest {
        String email;
        String password;
        String displayName;
    }

    private static class LoginRequest {
        String email;
        String password;
    }
}
