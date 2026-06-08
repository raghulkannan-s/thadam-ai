package com.thadam.ai.controllers;

import com.thadam.ai.dto.ApiResponse;
import com.thadam.ai.services.TaskService;
import com.thadam.ai.utils.JsonUtils;
import com.thadam.ai.utils.SessionUtils;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "TaskController", urlPatterns = "/api/tasks/*")
public class TaskController extends HttpServlet {
    private final TaskService taskService = new TaskService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        Long userId = SessionUtils.getUserId(req);
        if (userId == null) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_UNAUTHORIZED, new ApiResponse<>(false, "Not authenticated", null));
            return;
        }

        try {
            if ("/complete".equals(path)) {
                TaskActionRequest request = JsonUtils.readJson(req, TaskActionRequest.class);
                taskService.markCompleted(userId, request.taskId);
                JsonUtils.writeJson(resp, HttpServletResponse.SC_OK, new ApiResponse<>(true, "Task completed", null));
                return;
            }
            if ("/submit-proof".equals(path)) {
                TaskProofRequest request = JsonUtils.readJson(req, TaskProofRequest.class);
                taskService.submitProof(userId, request.taskId, request.proofUrl);
                JsonUtils.writeJson(resp, HttpServletResponse.SC_OK, new ApiResponse<>(true, "Proof submitted", null));
                return;
            }
            JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
        } catch (IllegalArgumentException ex) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, ex.getMessage(), null));
        } catch (Exception ex) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, new ApiResponse<>(false, "Server error", null));
        }
    }

    private static class TaskActionRequest {
        long taskId;
    }

    private static class TaskProofRequest {
        long taskId;
        String proofUrl;
    }
}
