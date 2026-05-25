package com.thadam.ai.utils;

import io.github.cdimascio.dotenv.Dotenv;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public final class EnvLoader {
    private static boolean loaded = false;

    private EnvLoader() {}

    public static synchronized void load() {
        if (loaded) {
            return;
        }
        Path repoDir = Paths.get(System.getProperty("user.dir"));
        Path servletEnv = repoDir.resolve("server-servlet").resolve(".env");
        if (Files.exists(servletEnv)) {
            Dotenv.configure()
                .directory(servletEnv.getParent().toString())
                .ignoreIfMissing()
                .systemProperties()
                .load();
        } else {
            Dotenv.configure()
                .ignoreIfMissing()
                .systemProperties()
                .load();
        }
        loaded = true;
    }
}
