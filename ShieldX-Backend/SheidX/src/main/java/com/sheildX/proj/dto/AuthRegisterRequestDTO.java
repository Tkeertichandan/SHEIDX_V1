package com.sheildX.proj.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AuthRegisterRequestDTO(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 60, message = "Username must be 3-60 characters")
    String username,
    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    String email,
    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,64}$",
        message = "Password must be 8-64 chars with letters, numbers, and symbols"
    )
    String password
) {
}
