package com.thadam.ai.services;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.thadam.ai.config.AppConfig;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class GeminiService {
    private static final Gson GSON = new Gson();

    public GeminiRoadmap generateRoadmap(String goal, int durationWeeks, String difficulty) throws IOException, InterruptedException {
        String apiKey = AppConfig.geminiApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        String prompt = buildPrompt(goal, durationWeeks, difficulty);
        JsonObject payload = new JsonObject();
        JsonObject content = new JsonObject();
        JsonObject part = new JsonObject();
        part.addProperty("text", prompt);
        content.add("parts", GSON.toJsonTree(new JsonObject[]{part}));
        payload.add("contents", GSON.toJsonTree(new JsonObject[]{content}));

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(30))
            .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(payload)))
            .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new IllegalStateException("Gemini API error: " + response.statusCode());
        }

        JsonObject root = GSON.fromJson(response.body(), JsonObject.class);
        String text = root.getAsJsonArray("candidates")
            .get(0).getAsJsonObject()
            .getAsJsonObject("content")
            .getAsJsonArray("parts")
            .get(0).getAsJsonObject()
            .get("text").getAsString();

        return GSON.fromJson(text, GeminiRoadmap.class);
    }

    private String buildPrompt(String goal, int durationWeeks, String difficulty) {
        return "You are an expert learning architect. Return ONLY JSON for a roadmap. "
            + "Goal: " + goal + ". Duration weeks: " + durationWeeks + ". Difficulty: " + difficulty + ". "
            + "Schema: {\"title\":string,\"tasks\":[{\"title\":string,\"description\":string,\"expectedDays\":number}]}";
    }

    public static class GeminiRoadmap {
        private String title;
        private GeminiTask[] tasks;

        public String getTitle() {
            return title;
        }

        public GeminiTask[] getTasks() {
            return tasks;
        }
    }

    public static class GeminiTask {
        private String title;
        private String description;
        private Integer expectedDays;

        public String getTitle() {
            return title;
        }

        public String getDescription() {
            return description;
        }

        public Integer getExpectedDays() {
            return expectedDays;
        }
    }
}
