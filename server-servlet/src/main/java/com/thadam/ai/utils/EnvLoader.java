package com.thadam.ai.utils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import io.github.cdimascio.dotenv.Dotenv;

public final class EnvLoader {
    private static boolean loaded = false;

    private EnvLoader() {}

    public static synchronized void load() {
        if (loaded) {
            return;
        }
        Path workingDir = Paths.get(System.getProperty("user.dir"));
        Path localEnv = workingDir.resolve(".env");
        Path repoEnv = workingDir.resolve("server-servlet").resolve(".env");

        if (Files.exists(localEnv)) {
            Dotenv.configure()
                .directory(localEnv.getParent().toString())
                .ignoreIfMissing()
                .systemProperties()
                .load();
        } else if (Files.exists(repoEnv)) {
            Dotenv.configure()
                .directory(repoEnv.getParent().toString())
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
