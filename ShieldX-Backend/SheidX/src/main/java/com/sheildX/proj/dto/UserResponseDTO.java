package com.sheildX.proj.dto;

public record UserResponseDTO(
    Long id,
    String name,
    String city,
    String zone,
    double zoneRisk,
    double workerRiskScore,
    double walletBalance
) {
}
