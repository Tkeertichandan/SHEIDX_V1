package com.sheildX.proj.dto;

import com.sheildX.proj.model.TriggerEvent;

public record AutomatedTriggerSignalDTO(
    TriggerEvent.TriggerType type,
    String zone,
    String description,
    double severity
) {
}
