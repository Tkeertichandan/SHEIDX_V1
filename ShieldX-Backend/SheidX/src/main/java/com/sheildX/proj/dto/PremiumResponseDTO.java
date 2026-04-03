package com.sheildX.proj.dto;

public record PremiumResponseDTO(
    Long userId,
    double basePrice,
    double zoneRisk,
    double workerRiskScore,
    double premium
) {
}
