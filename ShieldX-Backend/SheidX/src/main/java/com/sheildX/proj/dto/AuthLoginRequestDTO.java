package com.sheildX.proj.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthLoginRequestDTO(
    @NotBlank(message = "Username is required")
    String username,
    @NotBlank(message = "Password is required")
    String password
) {
}
