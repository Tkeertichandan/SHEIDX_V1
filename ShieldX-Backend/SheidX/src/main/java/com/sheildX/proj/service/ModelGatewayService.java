package com.sheildX.proj.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.sheildX.proj.dto.AIDiagnosticsResponseDTO;

@Service
public class ModelGatewayService {
    private final AtomicLong remoteRequests = new AtomicLong(0);
    private final AtomicLong remoteSuccesses = new AtomicLong(0);
    private final AtomicLong remoteFailures = new AtomicLong(0);
    private final AtomicLong fallbackCount = new AtomicLong(0);

    private volatile String lastFallbackReason = "None";
    private volatile String lastUpdatedAt = "Never";


    private static final Logger LOGGER = LoggerFactory.getLogger(ModelGatewayService.class);

    @Value("${shieldx.ai.mode:hybrid}")
    private String aiMode;

    @Value("${shieldx.ai.provider:openai}")
    private String provider;

    @Value("${shieldx.ai.openai.base-url:https://api.openai.com/v1}")
    private String openAiBaseUrl;

    @Value("${shieldx.ai.openai.api-key:}")
    private String openAiApiKey;

    @Value("${shieldx.ai.openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Value("${shieldx.ai.huggingface.base-url:https://api-inference.huggingface.co/models}")
    private String huggingFaceBaseUrl;

    @Value("${shieldx.ai.huggingface.api-key:}")
    private String huggingFaceApiKey;

    @Value("${shieldx.ai.huggingface.model:mistralai/Mistral-7B-Instruct-v0.2}")
    private String huggingFaceModel;

    @Value("${shieldx.ai.generation.temperature:0.2}")
    private double temperature;

    @Value("${shieldx.ai.generation.max-output-tokens:400}")
    private int maxOutputTokens;

    public Optional<String> generate(String systemPrompt, String userPrompt) {
        if ("mock".equalsIgnoreCase(aiMode)) {
            registerFallback("AI mode is mock");
            return Optional.empty();
        }

        remoteRequests.incrementAndGet();

        try {
            Optional<String> response = callRemote(systemPrompt, userPrompt);
            if (response.isPresent()) {
                remoteSuccesses.incrementAndGet();
                touch();
                return response;
            }

            if ("remote".equalsIgnoreCase(aiMode)) {
                LOGGER.warn("AI mode is remote, but provider call returned empty output.");
            }

            registerFallback("Provider returned empty response");
            return Optional.empty();
        } catch (Exception ex) {
            remoteFailures.incrementAndGet();
            registerFallback(ex.getClass().getSimpleName() + ": " + ex.getMessage());
            LOGGER.warn("Remote model call failed. Falling back to deterministic AI logic: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    public AIDiagnosticsResponseDTO diagnostics() {
        return new AIDiagnosticsResponseDTO(
            aiMode,
            provider,
            openAiModel,
            huggingFaceModel,
            remoteRequests.get(),
            remoteSuccesses.get(),
            remoteFailures.get(),
            fallbackCount.get(),
            lastFallbackReason,
            lastUpdatedAt
        );
    }

    private Optional<String> callRemote(String systemPrompt, String userPrompt) {
        if ("huggingface".equalsIgnoreCase(provider)) {
            return callHuggingFace(systemPrompt, userPrompt);
        }
        return callOpenAi(systemPrompt, userPrompt);
    }

    private Optional<String> callOpenAi(String systemPrompt, String userPrompt) {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            LOGGER.info("OpenAI API key is not configured. Skipping remote model call.");
            return Optional.empty();
        }

        RestClient client = RestClient.builder()
            .baseUrl(openAiBaseUrl)
            .build();

        Map<String, Object> payload = Map.of(
            "model", openAiModel,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ),
            "temperature", temperature,
            "max_tokens", maxOutputTokens
        );

        JsonNode node = client.post()
            .uri("/chat/completions")
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + openAiApiKey)
            .body(payload)
            .retrieve()
            .body(JsonNode.class);

        JsonNode contentNode = node
            .path("choices")
            .path(0)
            .path("message")
            .path("content");

        String content = contentNode.isMissingNode() ? "" : contentNode.asText("").trim();
        return content.isEmpty() ? Optional.empty() : Optional.of(content);
    }

    private Optional<String> callHuggingFace(String systemPrompt, String userPrompt) {
        if (huggingFaceApiKey == null || huggingFaceApiKey.isBlank()) {
            LOGGER.info("Hugging Face API key is not configured. Skipping remote model call.");
            return Optional.empty();
        }

        RestClient client = RestClient.builder()
            .baseUrl(huggingFaceBaseUrl)
            .build();

        String composedPrompt = "System: " + systemPrompt + "\nUser: " + userPrompt + "\nAssistant:";

        Map<String, Object> payload = Map.of(
            "inputs", composedPrompt,
            "parameters", Map.of(
                "max_new_tokens", Math.min(maxOutputTokens, 300),
                "temperature", temperature,
                "return_full_text", false
            )
        );

        JsonNode node = client.post()
            .uri("/" + huggingFaceModel)
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + huggingFaceApiKey)
            .body(payload)
            .retrieve()
            .body(JsonNode.class);

        String generated = "";
        if (node != null && node.isArray() && !node.isEmpty()) {
            generated = node.get(0).path("generated_text").asText("").trim();
        }

        if (generated.isBlank() && node != null && node.has("generated_text")) {
            generated = node.path("generated_text").asText("").trim();
        }

        return generated.isBlank() ? Optional.empty() : Optional.of(generated);
    }

    private void registerFallback(String reason) {
        fallbackCount.incrementAndGet();
        lastFallbackReason = reason == null || reason.isBlank() ? "Unknown fallback reason" : reason;
        touch();
    }

    private void touch() {
        lastUpdatedAt = java.time.OffsetDateTime.now().toString();
    }
}
