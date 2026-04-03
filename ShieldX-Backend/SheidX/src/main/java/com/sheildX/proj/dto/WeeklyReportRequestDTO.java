package com.sheildX.proj.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record WeeklyReportRequestDTO(
    @NotNull(message = "User id is required")
    Long userId,
    @Min(value = 0, message = "Completed deliveries cannot be negative")
    int completedDeliveries,
    @Min(value = 0, message = "Online hours cannot be negative")
    int onlineHours,
    @Min(value = 0, message = "Disruption hours cannot be negative")
    int disruptionHours
) {
}
