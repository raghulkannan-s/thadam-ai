package com.thadam.ai.common.client;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    private static final int MAX_RETRIES = 3;
    private static final Duration BASE_DELAY = Duration.ofSeconds(2);

    private final RestClient restClient;
    private final GeminiConfig config;

    public GeminiClient(GeminiConfig config) {
        this.config = config;
        this.restClient = RestClient.builder()
                .baseUrl(config.getEndpoint())
                .defaultHeader("Content-Type", "application/json")
                .requestInterceptor((request, body, execution) -> {
                    request.getHeaders().set("Content-Type", "application/json");
                    return execution.execute(request, body);
                })
                .build();
    }

    public String generateContent(String prompt) {
        log.info("GEMINI_REQUEST_STARTED promptSize={} correlationId={}",
                prompt.length(), MDC.get("correlationId"));

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            )),
            "generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 8192,
                "topP", 0.95
            )
        );

        long startTime = System.currentTimeMillis();
        RuntimeException lastException = null;

        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                if (attempt > 0) {
                    long delayMs = BASE_DELAY.toMillis() * (1L << (attempt - 1));
                    log.warn("GEMINI_RETRY attempt={}/{} delay={}ms correlationId={}",
                            attempt + 1, MAX_RETRIES, delayMs, MDC.get("correlationId"));
                    Thread.sleep(delayMs);
                }

                var response = restClient.post()
                        .uri(uriBuilder -> uriBuilder
                                .queryParam("key", config.getApiKey())
                                .build())
                        .body(requestBody)
                        .retrieve()
                        .onStatus(status -> status.is5xxServerError(), (req, res) -> {
                            throw new ResourceAccessException(
                                "Gemini API server error: " + res.getStatusCode());
                        })
                        .body(GeminiResponse.class);

                if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
                    throw new RuntimeException("Gemini API returned empty response");
                }

                String result = response.candidates().getFirst().content().parts().getFirst().text();
                long duration = System.currentTimeMillis() - startTime;
                log.info("GEMINI_RESPONSE_RECEIVED responseSize={} duration={}ms correlationId={}",
                        result.length(), duration, MDC.get("correlationId"));
                return result;

            } catch (ResourceAccessException | IllegalStateException e) {
                lastException = new RuntimeException("Gemini API request failed (attempt " + (attempt + 1) + "/" + MAX_RETRIES + "): " + e.getMessage(), e);
                log.warn("GEMINI_ATTEMPT_FAILED attempt={} error={} correlationId={}",
                        attempt + 1, e.getMessage(), MDC.get("correlationId"));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Gemini API retry interrupted", e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.error("GEMINI_REQUEST_FAILED duration={}ms correlationId={}",
                duration, MDC.get("correlationId"));
        throw lastException != null ? lastException : new RuntimeException("Gemini API request failed after " + MAX_RETRIES + " attempts");
    }

    private record GeminiResponse(
        List<Candidate> candidates
    ) {}

    private record Candidate(
        Content content
    ) {}

    private record Content(
        List<Part> parts
    ) {}

    private record Part(
        String text
    ) {}
}
