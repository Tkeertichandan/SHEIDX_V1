package com.sheildX.proj.dto;

import java.time.LocalDate;

public record PolicyResponseDTO(
    Long policyId,
    Long userId,
    double premium,
    LocalDate weekStart,
    LocalDate weekEnd,
    String status
) {
}
