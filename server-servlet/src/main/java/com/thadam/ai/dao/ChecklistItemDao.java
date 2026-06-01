package com.thadam.ai.dao;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.thadam.ai.models.ChecklistItem;

public class ChecklistItemDao {
    private final Connection connection;

    public ChecklistItemDao(Connection connection) {
        this.connection = connection;
    }

    public void insertItems(long roadmapId, List<ChecklistItem> items) throws SQLException {
        String sql = "INSERT INTO checklist_items (roadmap_id, title, description, status, due_date, priority, order_index, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            for (ChecklistItem item : items) {
                bindItem(stmt, roadmapId, item);
                stmt.addBatch();
            }
            stmt.executeBatch();
        }
    }

    public ChecklistItem insertItem(long roadmapId, ChecklistItem item) throws SQLException {
        String sql = "INSERT INTO checklist_items (roadmap_id, title, description, status, due_date, priority, order_index, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            bindItem(stmt, roadmapId, item);
            stmt.executeUpdate();
            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (!keys.next()) {
                    throw new SQLException("Failed to create checklist item");
                }
                long id = keys.getLong(1);
                return findById(id);
            }
        }
    }

    public ChecklistItem findById(long itemId) throws SQLException {
        String sql = "SELECT id, roadmap_id, title, description, status, due_date, priority, order_index, completed_at, created_at, updated_at FROM checklist_items WHERE id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, itemId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }
                return mapRow(rs);
            }
        }
    }

    public List<ChecklistItem> listByRoadmap(long roadmapId) throws SQLException {
        String sql = "SELECT id, roadmap_id, title, description, status, due_date, priority, order_index, completed_at, created_at, updated_at FROM checklist_items WHERE roadmap_id = ? ORDER BY order_index ASC";
        List<ChecklistItem> results = new ArrayList<>();
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

    public int nextOrderIndex(long roadmapId) throws SQLException {
        String sql = "SELECT COALESCE(MAX(order_index), 0) + 1 AS next_index FROM checklist_items WHERE roadmap_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, roadmapId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return 1;
                }
                return rs.getInt("next_index");
            }
        }
    }

    public void updateItem(long itemId, String title, String description, String status, LocalDate dueDate, String priority, Instant completedAt) throws SQLException {
        String sql = "UPDATE checklist_items SET title = ?, description = ?, status = ?, due_date = ?, priority = ?, completed_at = ? WHERE id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, title);
            stmt.setString(2, description);
            stmt.setString(3, status);
            if (dueDate == null) {
                stmt.setNull(4, java.sql.Types.DATE);
            } else {
                stmt.setDate(4, Date.valueOf(dueDate));
            }
            stmt.setString(5, priority);
            if (completedAt == null) {
                stmt.setNull(6, java.sql.Types.TIMESTAMP);
            } else {
                stmt.setTimestamp(6, Timestamp.from(completedAt));
            }
            stmt.setLong(7, itemId);
            stmt.executeUpdate();
        }
    }

    private void bindItem(PreparedStatement stmt, long roadmapId, ChecklistItem item) throws SQLException {
        stmt.setLong(1, roadmapId);
        stmt.setString(2, item.getTitle());
        stmt.setString(3, item.getDescription());
        stmt.setString(4, item.getStatus());
        if (item.getDueDate() == null) {
            stmt.setNull(5, java.sql.Types.DATE);
        } else {
            stmt.setDate(5, Date.valueOf(item.getDueDate()));
        }
        stmt.setString(6, item.getPriority());
        stmt.setInt(7, item.getOrderIndex());
        if (item.getCompletedAt() == null) {
            stmt.setNull(8, java.sql.Types.TIMESTAMP);
        } else {
            stmt.setTimestamp(8, Timestamp.from(item.getCompletedAt()));
        }
    }

    private ChecklistItem mapRow(ResultSet rs) throws SQLException {
        Date dueDate = rs.getDate("due_date");
        Timestamp completedAt = rs.getTimestamp("completed_at");
        return new ChecklistItem(
            rs.getLong("id"),
            rs.getLong("roadmap_id"),
            rs.getString("title"),
            rs.getString("description"),
            rs.getString("status"),
            dueDate == null ? null : dueDate.toLocalDate(),
            rs.getString("priority"),
            rs.getInt("order_index"),
            completedAt == null ? null : completedAt.toInstant(),
            toInstant(rs, "created_at"),
            toInstant(rs, "updated_at")
        );
    }

    public void deleteByRoadmap(long roadmapId) throws SQLException {
        String sql = "DELETE FROM checklist_items WHERE roadmap_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, roadmapId);
            stmt.executeUpdate();
        }
    }

    public void deleteById(long itemId) throws SQLException {
        String sql = "DELETE FROM checklist_items WHERE id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, itemId);
            stmt.executeUpdate();
        }
    }

    private Instant toInstant(ResultSet rs, String column) throws SQLException {
        return rs.getTimestamp(column).toInstant();
    }
}
