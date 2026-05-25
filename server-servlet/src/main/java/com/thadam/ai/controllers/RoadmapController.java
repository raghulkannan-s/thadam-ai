package com.thadam.ai.controllers;

import com.thadam.ai.dto.ApiResponse;
import com.thadam.ai.dto.RoadmapDto;
import com.thadam.ai.services.RoadmapService;
import com.thadam.ai.utils.JsonUtils;
import com.thadam.ai.utils.SessionUtils;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "RoadmapController", urlPatterns = "/api/roadmaps/*")
public class RoadmapController extends HttpServlet {
    private final RoadmapService roadmapService = new RoadmapService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        Long userId = SessionUtils.getUserId(req);

        if (userId == null) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_UNAUTHORIZED, new ApiResponse<>(false, "Not authenticated", null));
            return;
        }

        try {
            if (path == null || "/".equals(path)) {
                List<RoadmapDto> roadmaps = roadmapService.listRoadmaps(userId);
                JsonUtils.writeJson(resp, HttpServletResponse.SC_OK, new ApiResponse<>(true, "Roadmaps", roadmaps));
                return;
            }
            JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
        } catch (Exception ex) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, new ApiResponse<>(false, "Server error", null));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        Long userId = SessionUtils.getUserId(req);
        if (userId == null) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_UNAUTHORIZED, new ApiResponse<>(false, "Not authenticated", null));
            return;
        }

        try {
            if ("/generate".equals(path)) {
                GenerateRequest request = JsonUtils.readJson(req, GenerateRequest.class);
                RoadmapDto roadmap = roadmapService.generateRoadmap(userId, request.goal, request.durationWeeks, request.difficulty);
                JsonUtils.writeJson(resp, HttpServletResponse.SC_CREATED, new ApiResponse<>(true, "Roadmap created", roadmap));
                return;
            }
            JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
        } catch (IllegalArgumentException ex) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, ex.getMessage(), null));
        } catch (Exception ex) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, new ApiResponse<>(false, "Server error", null));
        }
    }

    private static class GenerateRequest {
        String goal;
        int durationWeeks;
        String difficulty;
    }
}
