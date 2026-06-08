package com.thadam.ai.utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import com.thadam.ai.config.AppConfig;

public final class DbConnection {
    private static boolean driverLoaded = false;

    private DbConnection() {}

    public static Connection getConnection() throws SQLException {
        loadDriver();
        Connection connection = DriverManager.getConnection(AppConfig.dbUrl(), AppConfig.dbUser(), AppConfig.dbPassword());
        connection.setAutoCommit(true);
        return connection;
    }

    public static Connection getTransactionalConnection() throws SQLException {
        loadDriver();
        Connection connection = DriverManager.getConnection(AppConfig.dbUrl(), AppConfig.dbUser(), AppConfig.dbPassword());
        connection.setAutoCommit(false);
        return connection;
    }

    private static synchronized void loadDriver() {
        if (driverLoaded) {
            return;
        }
        try {
            Class.forName("com.mysql.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL JDBC driver not found. Make sure mysql-connector-java is in the classpath.", e);
        }
        driverLoaded = true;
    }
}
