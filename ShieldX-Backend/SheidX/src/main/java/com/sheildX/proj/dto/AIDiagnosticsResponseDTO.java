package com.sheildX.proj.dto;

public record AIDiagnosticsResponseDTO(
    String mode,
    String provider,
    String openAiModel,
    String huggingFaceModel,
    long remoteRequests,
    long remoteSuccesses,
    long remoteFailures,
    long fallbackCount,
    String lastFallbackReason,
    String lastUpdatedAt
) {
}
