package com.thadam.ai.controllers;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.thadam.ai.dto.ApiResponse;
import com.thadam.ai.dto.ChecklistItemDto;
import com.thadam.ai.services.ChecklistService;
import com.thadam.ai.utils.JsonUtils;
import com.thadam.ai.utils.SessionUtils;

@WebServlet(name = "ChecklistController", urlPatterns = "/api/checklists/*")
public class ChecklistController extends HttpServlet {
    private final ChecklistService checklistService = new ChecklistService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        Long userId = SessionUtils.getUserId(req);
        if (userId == null) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_UNAUTHORIZED, new ApiResponse<>(false, "Not authenticated", null));
            return;
        }

        try {
            if (path != null && path.startsWith("/roadmap/")) {
                long roadmapId = parseId(path, "/roadmap/");
                List<ChecklistItemDto> items = checklistService.listItems(userId, roadmapId);
                JsonUtils.writeJson(resp, HttpServletResponse.SC_OK, new ApiResponse<>(true, "Checklist items", items));
                return;
            }
            JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
        } catch (IllegalArgumentException ex) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, ex.getMessage(), null));
        } catch (Exception ex) {
            ex.printStackTrace();
            JsonUtils.writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, new ApiResponse<>(false, "Server error: " + ex.getMessage(), null));
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
            if (path != null && path.startsWith("/roadmap/")) {
                long roadmapId = parseId(path, "/roadmap/");
                ChecklistCreateRequest request = JsonUtils.readJson(req, ChecklistCreateRequest.class);
                if (request == null) {
                    JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, "Invalid request body", null));
                    return;
                }
                ChecklistItemDto item = checklistService.addItem(userId, roadmapId, request.title, request.description, parseDate(request.dueDate), request.priority);
                JsonUtils.writeJson(resp, HttpServletResponse.SC_CREATED, new ApiResponse<>(true, "Checklist item created", item));
                return;
            }
            JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
        } catch (IllegalArgumentException ex) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, ex.getMessage(), null));
        } catch (Exception ex) {
            ex.printStackTrace();
            JsonUtils.writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, new ApiResponse<>(false, "Server error: " + ex.getMessage(), null));
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        Long userId = SessionUtils.getUserId(req);
        if (userId == null) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_UNAUTHORIZED, new ApiResponse<>(false, "Not authenticated", null));
            return;
        }

        try {
            if (path != null && path.startsWith("/item/")) {
                long itemId = parseId(path, "/item/");
                ChecklistUpdateRequest request = JsonUtils.readJson(req, ChecklistUpdateRequest.class);
                if (request == null) {
                    JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, "Invalid request body", null));
                    return;
                }
                ChecklistItemDto item = checklistService.updateItem(userId, itemId, request.title, request.description, request.status, parseDate(request.dueDate), request.priority);
                JsonUtils.writeJson(resp, HttpServletResponse.SC_OK, new ApiResponse<>(true, "Checklist item updated", item));
                return;
            }
            JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
        } catch (IllegalArgumentException ex) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, ex.getMessage(), null));
        } catch (Exception ex) {
            ex.printStackTrace();
            JsonUtils.writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, new ApiResponse<>(false, "Server error: " + ex.getMessage(), null));
        }
    }

    private long parseId(String path, String prefix) {
        String value = path.substring(prefix.length());
        return Long.parseLong(value);
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        Long userId = SessionUtils.getUserId(req);
        if (userId == null) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_UNAUTHORIZED, new ApiResponse<>(false, "Not authenticated", null));
            return;
        }

        try {
            if (path != null && path.startsWith("/item/")) {
                long itemId = parseId(path, "/item/");
                checklistService.deleteItem(userId, itemId);
                JsonUtils.writeJson(resp, HttpServletResponse.SC_OK, new ApiResponse<>(true, "Checklist item deleted", null));
                return;
            }
            JsonUtils.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, new ApiResponse<>(false, "Not found", null));
        } catch (IllegalArgumentException ex) {
            JsonUtils.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, new ApiResponse<>(false, ex.getMessage(), null));
        } catch (Exception ex) {
            ex.printStackTrace();
            JsonUtils.writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, new ApiResponse<>(false, "Server error: " + ex.getMessage(), null));
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalDate.parse(value);
    }

    private static class ChecklistCreateRequest {
        String title;
        String description;
        String dueDate;
        String priority;
    }

    private static class ChecklistUpdateRequest {
        String title;
        String description;
        String dueDate;
        String priority;
        String status;
    }
}
