package com.thadam.ai.config;

import com.thadam.ai.utils.EnvLoader;

public final class AppConfig {
    static {
        EnvLoader.load();
    }

    private AppConfig() {}

    public static String getEnv(String key, String defaultValue) {
        String value = System.getProperty(key);
        if (value == null || value.isBlank()) {
            value = System.getenv(key);
        }
        return value == null || value.isBlank() ? defaultValue : value;
    }

    public static String dbUrl() {
        String host = getEnv("DB_HOST", "localhost");
        String port = getEnv("DB_PORT", "3306");
        String name = getEnv("DB_NAME", "thadam_ai");
        return getEnv("DB_URL", "jdbc:mysql://" + host + ":" + port + "/" + name + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
    }

    public static String dbUser() {
        return getEnv("DB_USER", "root");
    }

    public static String dbPassword() {
        return getEnv("DB_PASSWORD", "");
    }

    public static String geminiApiKey() {
        return getEnv("GEMINI_API_KEY", "");
    }

    public static String geminiModel() {
        return getEnv("GEMINI_MODEL", "gemini-1.5-flash-latest");
    }

    public static String geminiApiVersion() {
        return getEnv("GEMINI_API_VERSION", "v1");
    }

    public static String allowedOrigin() {
        return getEnv("APP_ALLOWED_ORIGIN", "http://localhost:3000");
    }
}
