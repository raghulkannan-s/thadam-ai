package com.thadam.ai.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class TaskSubmissionDao {
    private final Connection connection;

    public TaskSubmissionDao(Connection connection) {
        this.connection = connection;
    }

    public void insert(long taskId, long userId, String proofUrl, String status) throws SQLException {
        String sql = "INSERT INTO task_submissions (task_id, user_id, proof_url, status) VALUES (?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, taskId);
            stmt.setLong(2, userId);
            if (proofUrl == null || proofUrl.isBlank()) {
                stmt.setNull(3, java.sql.Types.VARCHAR);
            } else {
                stmt.setString(3, proofUrl);
            }
            stmt.setString(4, status);
            stmt.executeUpdate();
        }
    }
}
