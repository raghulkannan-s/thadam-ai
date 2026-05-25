package com.thadam.ai.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import com.thadam.ai.models.RoadmapTask;

public class RoadmapTaskDao {
    private final Connection connection;

    public RoadmapTaskDao(Connection connection) {
        this.connection = connection;
    }

    public void insertTasks(long roadmapId, List<RoadmapTask> tasks) throws SQLException {
        String sql = "INSERT INTO roadmap_tasks (roadmap_id, title, description, order_index, expected_days) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            for (RoadmapTask task : tasks) {
                stmt.setLong(1, roadmapId);
                stmt.setString(2, task.getTitle());
                stmt.setString(3, task.getDescription());
                stmt.setInt(4, task.getOrderIndex());
                if (task.getExpectedDays() == null) {
                    stmt.setNull(5, java.sql.Types.INTEGER);
                } else {
                    stmt.setInt(5, task.getExpectedDays());
                }
                stmt.addBatch();
            }
            stmt.executeBatch();
        }
    }

    public List<RoadmapTask> listByRoadmap(long roadmapId) throws SQLException {
        String sql = "SELECT id, roadmap_id, title, description, order_index, expected_days, created_at, updated_at FROM roadmap_tasks WHERE roadmap_id = ? ORDER BY order_index ASC";
        List<RoadmapTask> results = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, roadmapId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    results.add(mapRow(rs));
                }
            }
        }
        return results;
    }

    public Long findTaskOwnerUserId(long taskId) throws SQLException {
        String sql = "SELECT r.user_id FROM roadmap_tasks t JOIN roadmaps r ON t.roadmap_id = r.id WHERE t.id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, taskId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }
                return rs.getLong("user_id");
            }
        }
    }

    private RoadmapTask mapRow(ResultSet rs) throws SQLException {
        return new RoadmapTask(
            rs.getLong("id"),
            rs.getLong("roadmap_id"),
            rs.getString("title"),
            rs.getString("description"),
            rs.getInt("order_index"),
            rs.getObject("expected_days", Integer.class),
            toInstant(rs, "created_at"),
            toInstant(rs, "updated_at")
        );
    }

    private Instant toInstant(ResultSet rs, String column) throws SQLException {
        return rs.getTimestamp(column).toInstant();
    }
}
