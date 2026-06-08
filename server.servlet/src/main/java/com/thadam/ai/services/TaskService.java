package com.thadam.ai.services;

import com.thadam.ai.dao.RoadmapTaskDao;
import com.thadam.ai.dao.TaskSubmissionDao;
import com.thadam.ai.utils.DbConnection;
import com.thadam.ai.utils.ValidationUtils;

import java.sql.Connection;
import java.sql.SQLException;

public class TaskService {
    public void markCompleted(long userId, long taskId) throws SQLException {
        try (Connection connection = DbConnection.getConnection()) {
            RoadmapTaskDao taskDao = new RoadmapTaskDao(connection);
            Long ownerId = taskDao.findTaskOwnerUserId(taskId);
            if (ownerId == null) {
                throw new IllegalArgumentException("Task not found");
            }
            if (ownerId != userId) {
                throw new IllegalArgumentException("Unauthorized task access");
            }
            TaskSubmissionDao submissionDao = new TaskSubmissionDao(connection);
            submissionDao.insert(taskId, userId, null, "COMPLETED");
        }
    }

    public void submitProof(long userId, long taskId, String proofUrl) throws SQLException {
        if (!ValidationUtils.isNonEmpty(proofUrl)) {
            throw new IllegalArgumentException("Proof URL is required");
        }
        try (Connection connection = DbConnection.getConnection()) {
            RoadmapTaskDao taskDao = new RoadmapTaskDao(connection);
            Long ownerId = taskDao.findTaskOwnerUserId(taskId);
            if (ownerId == null) {
                throw new IllegalArgumentException("Task not found");
            }
            if (ownerId != userId) {
                throw new IllegalArgumentException("Unauthorized task access");
            }
            TaskSubmissionDao submissionDao = new TaskSubmissionDao(connection);
            submissionDao.insert(taskId, userId, proofUrl, "PENDING");
        }
    }
}
