package com.sheildX.proj.dto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record PremiumCalculationRequestDTO(
    @NotNull(message = "User id is required")
    Long userId,
    @DecimalMin(value = "1.0", message = "Base price must be greater than 0")
    double basePrice
) {
}
