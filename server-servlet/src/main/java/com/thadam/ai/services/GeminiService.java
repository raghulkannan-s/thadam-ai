package com.thadam.ai.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.thadam.ai.config.AppConfig;

public class GeminiService {
    private static final Gson GSON = new Gson();
    private static final int MAX_RETRIES = 2;
    private static final int RETRY_DELAY_MS = 2000;

    public static String toJson(Object value) {
        return GSON.toJson(value);
    }

    public GeminiRoadmap generateRoadmap(String goal, int durationWeeks, String difficulty) throws IOException, InterruptedException {
        String apiKey = AppConfig.geminiApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini API key is not configured. Set the GEMINI_API_KEY environment variable.");
        }

        String systemInstruction = buildSystemInstruction();
        String userPrompt = buildUserPrompt(goal, durationWeeks, difficulty);

        JsonObject payload = new JsonObject();

        // System instruction
        JsonObject systemContent = new JsonObject();
        JsonObject systemPart = new JsonObject();
        systemPart.addProperty("text", systemInstruction);
        JsonArray systemParts = new JsonArray();
        systemParts.add(systemPart);
        systemContent.add("parts", systemParts);
        payload.add("system_instruction", systemContent);

        // User content
        JsonObject userContent = new JsonObject();
        userContent.addProperty("role", "user");
        JsonObject userPart = new JsonObject();
        userPart.addProperty("text", userPrompt);
        JsonArray userParts = new JsonArray();
        userParts.add(userPart);
        userContent.add("parts", userParts);
        JsonArray contents = new JsonArray();
        contents.add(userContent);
        payload.add("contents", contents);

        // Generation config — force JSON output
        JsonObject generationConfig = new JsonObject();
        generationConfig.addProperty("responseMimeType", "application/json");
        generationConfig.addProperty("temperature", 0.7);
        payload.add("generationConfig", generationConfig);

        String model = AppConfig.geminiModel();
        if (model != null && model.startsWith("models/")) {
            model = model.substring("models/".length());
        }
        String apiVersion = AppConfig.geminiApiVersion();
        String url = "https://generativelanguage.googleapis.com/" + apiVersion + "/models/" + model + ":generateContent?key=" + apiKey;

        // Retry logic for transient failures
        IOException lastException = null;
        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                String responseBody = executeRequest(url, GSON.toJson(payload));
                JsonObject root = GSON.fromJson(responseBody, JsonObject.class);

                // Check for API-level errors
                if (root.has("error")) {
                    String errorMsg = root.getAsJsonObject("error").get("message").getAsString();
                    throw new IllegalStateException("Gemini API error: " + errorMsg);
                }

                String text = root.getAsJsonArray("candidates")
                    .get(0).getAsJsonObject()
                    .getAsJsonObject("content")
                    .getAsJsonArray("parts")
                    .get(0).getAsJsonObject()
                    .get("text").getAsString();

                String json = normalizeJson(text);
                GeminiRoadmap roadmap = GSON.fromJson(json, GeminiRoadmap.class);

                if (roadmap == null || roadmap.getTasks() == null || roadmap.getTasks().length == 0) {
                    throw new IllegalStateException("AI returned an empty roadmap. Please try again with a more specific goal.");
                }

                return roadmap;
            } catch (IOException e) {
                lastException = e;
                if (attempt < MAX_RETRIES) {
                    Thread.sleep(RETRY_DELAY_MS * (attempt + 1));
                }
            }
        }
        throw new IOException("Failed to reach Gemini API after " + (MAX_RETRIES + 1) + " attempts: " + (lastException != null ? lastException.getMessage() : "unknown error"), lastException);
    }

    private String executeRequest(String url, String body) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("POST");
        connection.setConnectTimeout(30000);
        connection.setReadTimeout(60000);
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/json");

        byte[] bodyBytes = body.getBytes(StandardCharsets.UTF_8);
        try (OutputStream outputStream = connection.getOutputStream()) {
            outputStream.write(bodyBytes);
        }

        int status = connection.getResponseCode();
        InputStream stream = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
        String responseBody = readResponse(stream);
        if (status >= 400) {
            if (status == 429) {
                throw new IOException("Rate limited by Gemini API. Please wait and try again.");
            }
            if (status == 401 || status == 403) {
                throw new IllegalStateException("Gemini API key is invalid or expired. Please check your GEMINI_API_KEY.");
            }
            throw new IllegalStateException("Gemini API error (" + status + "): " + responseBody);
        }
        return responseBody;
    }

    public JsonObject listModels() throws IOException {
        String apiKey = AppConfig.geminiApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini API key is not configured");
        }
        String apiVersion = AppConfig.geminiApiVersion();
        String url = "https://generativelanguage.googleapis.com/" + apiVersion + "/models?key=" + apiKey;
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(30000);
        connection.setReadTimeout(30000);

        int status = connection.getResponseCode();
        InputStream stream = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
        String responseBody = readResponse(stream);
        if (status >= 400) {
            throw new IllegalStateException("Gemini API error: " + status + " - " + responseBody);
        }
        return GSON.fromJson(responseBody, JsonObject.class);
    }

    private String readResponse(InputStream stream) throws IOException {
        if (stream == null) {
            return "";
        }
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
        }
        return builder.toString();
    }

    private String buildSystemInstruction() {
        return "You are an expert learning architect and curriculum designer. " +
            "Your job is to create highly structured, actionable learning roadmaps that can be executed as daily checklists. " +
            "Each task should be specific, measurable, and achievable within the expected timeframe. " +
            "Include a mix of theory (reading/watching), practice (coding/exercises), and project work. " +
            "Always respond with valid JSON matching the exact schema requested. " +
            "Do NOT include markdown, code fences, or any text outside the JSON object.";
    }

    private String buildUserPrompt(String goal, int durationWeeks, String difficulty) {
        return "Create a comprehensive, structured learning roadmap.\n\n" +
            "Goal: " + goal + "\n" +
            "Duration: " + durationWeeks + " weeks\n" +
            "Difficulty Level: " + difficulty + "\n\n" +
            "Requirements:\n" +
            "- Break the goal into sequential, logically-ordered tasks\n" +
            "- Each task should be completable independently\n" +
            "- Include specific resources, exercises, or project ideas in the descriptions\n" +
            "- Tasks should progressively increase in complexity\n" +
            "- Total expected days across all tasks should roughly equal " + (durationWeeks * 5) + " working days\n" +
            "- Aim for " + Math.max(5, durationWeeks * 2) + " to " + Math.max(10, durationWeeks * 3) + " tasks total\n\n" +
            "Return JSON matching this exact schema:\n" +
            "{\n" +
            "  \"title\": \"<concise roadmap title>\",\n" +
            "  \"tasks\": [\n" +
            "    {\n" +
            "      \"title\": \"<specific task title>\",\n" +
            "      \"description\": \"<2-3 sentences: what to do, resources to use, expected outcome>\",\n" +
            "      \"expectedDays\": <number of working days>\n" +
            "    }\n" +
            "  ]\n" +
            "}";
    }

    private String normalizeJson(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        if (trimmed.startsWith("```")) {
            int start = trimmed.indexOf('\n');
            int end = trimmed.lastIndexOf("```");
            if (start > -1 && end > start) {
                trimmed = trimmed.substring(start + 1, end).trim();
            }
        }
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            try {
                trimmed = GSON.fromJson(trimmed, String.class);
            } catch (Exception ignored) {
            }
        }
        return trimmed;
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
