package com.sheildX.proj.dto;

import java.time.LocalDateTime;

public record TriggerEventResponseDTO(
    Long id,
    String type,
    String zone,
    String description,
    double severity,
    LocalDateTime occurredAt,
    boolean active
) {
}
