package com.sheildX.proj.dto;

import java.time.LocalDateTime;

public record ClaimResponseDTO(
    Long id,
    Long userId,
    Long policyId,
    Long triggerEventId,
    double payout,
    String reason,
    String status,
    LocalDateTime createdAt
) {
}
