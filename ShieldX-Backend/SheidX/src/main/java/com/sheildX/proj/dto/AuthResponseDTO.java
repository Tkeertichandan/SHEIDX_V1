package com.sheildX.proj.dto;

public record AuthResponseDTO(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresInSeconds,
    String username,
    String role
) {
}
