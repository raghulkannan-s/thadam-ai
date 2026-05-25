package com.thadam.ai.utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import com.thadam.ai.config.AppConfig;

public final class DbConnection {
    private DbConnection() {}

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(AppConfig.dbUrl(), AppConfig.dbUser(), AppConfig.dbPassword());
    }
}
