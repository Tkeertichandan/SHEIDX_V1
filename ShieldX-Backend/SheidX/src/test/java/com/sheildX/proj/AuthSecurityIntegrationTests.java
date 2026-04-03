package com.sheildX.proj;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthSecurityIntegrationTests {

    @LocalServerPort
    private int port;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void loginShouldReturnJwtTokensForDefaultAdmin() throws Exception {
        Map<String, String> payload = Map.of(
            "username", "admin",
            "password", "Admin@12345"
        );

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url("/api/auth/login")))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        Map<?, ?> body = objectMapper.readValue(response.body(), Map.class);

        assertEquals(200, response.statusCode());
        assertNotNull(body);
        assertNotNull(body.get("accessToken"));
        assertNotNull(body.get("refreshToken"));
        assertEquals("ADMIN", body.get("role"));
    }

    @Test
    void protectedRouteShouldRejectWhenNoToken() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url("/api/users")))
            .GET()
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        assertTrue(response.statusCode() >= 400 && response.statusCode() < 500);
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
