package com.thadam.ai.common.client;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @org.springframework.beans.factory.annotation.Value("${GEMINI_API_KEY}")
    private String apiKey;

    @org.springframework.beans.factory.annotation.Value("${GEMINI_API_VERSION:v1beta}")
    private String apiVersion;

    @org.springframework.beans.factory.annotation.Value("${GEMINI_MODEL:gemini-2.5-flash}")
    private String model;

    @org.springframework.beans.factory.annotation.Value("${GEMINI_BASE_URL:https://generativelanguage.googleapis.com}")
    private String baseUrl;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public void setApiVersion(String apiVersion) {
        this.apiVersion = apiVersion;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getEndpoint() {
        return baseUrl + "/" + apiVersion + "/models/" + model + ":generateContent";
    }
}
