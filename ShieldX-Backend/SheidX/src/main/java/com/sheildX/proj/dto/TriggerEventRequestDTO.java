package com.sheildX.proj.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TriggerEventRequestDTO(
    @NotBlank(message = "Type is required")
    @Pattern(regexp = "WEATHER|PLATFORM|REGULATORY", message = "Type must be WEATHER, PLATFORM, or REGULATORY")
    String type,
    @NotBlank(message = "Zone is required")
    @Size(max = 100, message = "Zone must be at most 100 characters")
    String zone,
    @NotBlank(message = "Description is required")
    @Size(max = 300, message = "Description must be at most 300 characters")
    String description,
    @DecimalMin(value = "0.0", message = "Severity must be at least 0")
    @DecimalMax(value = "1.5", message = "Severity must be at most 1.5")
    double severity
) {
}
