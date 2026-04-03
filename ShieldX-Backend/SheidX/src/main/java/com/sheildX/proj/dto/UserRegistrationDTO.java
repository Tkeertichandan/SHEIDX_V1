package com.sheildX.proj.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegistrationDTO(
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    String name,
    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must be at most 100 characters")
    String city,
    @NotBlank(message = "Zone is required")
    @Size(max = 100, message = "Zone must be at most 100 characters")
    String zone,
    @DecimalMin(value = "0.5", message = "Zone risk must be at least 0.5")
    @DecimalMax(value = "3.0", message = "Zone risk must be at most 3.0")
    double zoneRisk,
    @DecimalMin(value = "0.5", message = "Worker risk score must be at least 0.5")
    @DecimalMax(value = "3.0", message = "Worker risk score must be at most 3.0")
    double workerRiskScore
) {
}
