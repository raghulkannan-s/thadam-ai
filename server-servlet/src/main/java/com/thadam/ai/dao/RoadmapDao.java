package com.thadam.ai.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import com.thadam.ai.models.Roadmap;

public class RoadmapDao {
    private final Connection connection;

    public RoadmapDao(Connection connection) {
        this.connection = connection;
    }

    public Roadmap insert(long userId, String title, String goal, int durationWeeks, String difficulty, String status) throws SQLException {
        String sql = "INSERT INTO roadmaps (user_id, title, goal, duration_weeks, difficulty, status) VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setLong(1, userId);
            stmt.setString(2, title);
            stmt.setString(3, goal);
            stmt.setInt(4, durationWeeks);
            stmt.setString(5, difficulty);
            stmt.setString(6, status);
            stmt.executeUpdate();
            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (!keys.next()) {
                    throw new SQLException("Failed to create roadmap");
                }
                long id = keys.getLong(1);
                return findByIdAndUser(id, userId);
            }
        }
    }

    public Roadmap findByIdAndUser(long id, long userId) throws SQLException {
        String sql = "SELECT id, user_id, title, goal, duration_weeks, difficulty, status, created_at, updated_at FROM roadmaps WHERE id = ? AND user_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, id);
            stmt.setLong(2, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }
                return mapRow(rs);
            }
        }
    }

    public List<Roadmap> listByUser(long userId) throws SQLException {
        String sql = "SELECT id, user_id, title, goal, duration_weeks, difficulty, status, created_at, updated_at FROM roadmaps WHERE user_id = ? ORDER BY created_at DESC";
        List<Roadmap> results = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    results.add(mapRow(rs));
                }
            }
        }
        return results;
    }

    private Roadmap mapRow(ResultSet rs) throws SQLException {
        return new Roadmap(
            rs.getLong("id"),
            rs.getLong("user_id"),
            rs.getString("title"),
            rs.getString("goal"),
            rs.getInt("duration_weeks"),
            rs.getString("difficulty"),
            rs.getString("status"),
            toInstant(rs, "created_at"),
            toInstant(rs, "updated_at")
        );
    }

    private Instant toInstant(ResultSet rs, String column) throws SQLException {
        return rs.getTimestamp(column).toInstant();
    }
}
