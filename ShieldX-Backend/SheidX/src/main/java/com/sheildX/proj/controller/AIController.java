package com.sheildX.proj.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sheildX.proj.dto.AIDiagnosticsResponseDTO;
import com.sheildX.proj.dto.ChatRequestDTO;
import com.sheildX.proj.dto.ChatResponseDTO;
import com.sheildX.proj.dto.WeeklyReportRequestDTO;
import com.sheildX.proj.dto.WeeklyReportResponseDTO;
import com.sheildX.proj.service.AIService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ChatResponseDTO chat(@Valid @RequestBody ChatRequestDTO request) {
        return new ChatResponseDTO(aiService.answerQuestion(request.question()));
    }

    @PostMapping("/weekly-report")
    public WeeklyReportResponseDTO weeklyReport(@Valid @RequestBody WeeklyReportRequestDTO request) {
        return aiService.generateWeeklyReport(request);
    }

    @GetMapping("/diagnostics")
    public AIDiagnosticsResponseDTO diagnostics() {
        return aiService.diagnostics();
    }
}
