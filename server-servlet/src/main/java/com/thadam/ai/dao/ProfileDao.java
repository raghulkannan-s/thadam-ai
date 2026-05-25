package com.thadam.ai.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import com.thadam.ai.models.Profile;

public class ProfileDao {
    private final Connection connection;

    public ProfileDao(Connection connection) {
        this.connection = connection;
    }

    public Profile insert(long userId, String displayName) throws SQLException {
        String sql = "INSERT INTO profiles (user_id, display_name) VALUES (?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            stmt.setString(2, displayName);
            stmt.executeUpdate();
        }
        return findByUserId(userId);
    }

    public Profile findByUserId(long userId) throws SQLException {
        String sql = "SELECT user_id, display_name, bio, avatar_url, last_activity_date, created_at, updated_at FROM profiles WHERE user_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }
                return new Profile(
                    rs.getLong("user_id"),
                    rs.getString("display_name"),
                    rs.getString("bio"),
                    rs.getString("avatar_url"),
                    rs.getDate("last_activity_date") == null ? null : rs.getDate("last_activity_date").toLocalDate(),
                    toInstant(rs, "created_at"),
                    toInstant(rs, "updated_at")
                );
            }
        }
    }

    private Instant toInstant(ResultSet rs, String column) throws SQLException {
        return rs.getTimestamp(column).toInstant();
    }
}
