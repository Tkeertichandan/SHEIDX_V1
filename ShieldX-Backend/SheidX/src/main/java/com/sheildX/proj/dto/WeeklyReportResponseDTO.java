package com.sheildX.proj.dto;

import java.util.List;

public record WeeklyReportResponseDTO(
    String summary,
    List<String> recommendedActions
) {
}
