package com.thadam.ai.controllers;

import java.io.IOException;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.thadam.ai.dto.ApiResponse;
import com.thadam.ai.services.GeminiService;
import com.thadam.ai.utils.JsonUtils;

@WebServlet(name = "AiController", urlPatterns = "/api/ai/*")
public class AiController extends HttpServlet {
    private final GeminiService geminiService = new GeminiService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null || "/models".equals(path)) {
            try {
                Object models = geminiService.listModels();
                JsonUtils.writeJson(resp, HttpServletResponse.SC_OK, new ApiResponse<>(true, "Models", models));
            } catch (Exception ex) {
                ex.printStackTrace();
                JsonUtils.writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, new ApiResponse<>(false, "Server error: " + ex.getMessage(), null));
            }
            return;
        }
        JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
    }
}
