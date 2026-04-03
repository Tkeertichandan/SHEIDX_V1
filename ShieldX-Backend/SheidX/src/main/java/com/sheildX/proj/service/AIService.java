package com.sheildX.proj.service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.sheildX.proj.dto.AIDiagnosticsResponseDTO;
import com.sheildX.proj.dto.WeeklyReportRequestDTO;
import com.sheildX.proj.dto.WeeklyReportResponseDTO;

@Service
public class AIService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AIService.class);

    private final ModelGatewayService modelGatewayService;

    public AIService(ModelGatewayService modelGatewayService) {
        this.modelGatewayService = modelGatewayService;
    }

    public String answerQuestion(String question) {
        String safeQuestion = question == null ? "" : question.trim();
        String systemPrompt = "You are ShieldX AI. Answer in 1-3 concise sentences about parametric insurance operations for gig workers.";
        String userPrompt = "Question: " + safeQuestion;

        String remote = modelGatewayService.generate(systemPrompt, userPrompt).orElse("");
        if (!remote.isBlank()) {
            return remote;
        }

        return fallbackAnswer(safeQuestion);
    }

    public WeeklyReportResponseDTO generateWeeklyReport(WeeklyReportRequestDTO request) {
        String systemPrompt = "You are ShieldX AI analyst. Return STRICT JSON only with keys summary (string) and recommendedActions (array of 2-4 strings).";
        String userPrompt = "Generate weekly rider report for userId=" + request.userId()
            + ", completedDeliveries=" + request.completedDeliveries()
            + ", onlineHours=" + request.onlineHours()
            + ", disruptionHours=" + request.disruptionHours() + ".";

        String remote = modelGatewayService.generate(systemPrompt, userPrompt).orElse("");
        WeeklyReportResponseDTO parsed = parseStructuredWeeklyResponse(remote);
        if (parsed != null) {
            return parsed;
        }

        return fallbackWeeklyReport(request);
    }

    public AIDiagnosticsResponseDTO diagnostics() {
        return modelGatewayService.diagnostics();
    }

    private String fallbackAnswer(String question) {
        String q = question == null ? "" : question.toLowerCase();
        if (q.contains("premium")) {
            return "Weekly premium uses Base Price x Zone Risk x Worker Risk Score. Lower disruption zones and consistent activity usually reduce cost.";
        }
        if (q.contains("claim") || q.contains("payout")) {
            return "Claims are auto-generated when a trigger is detected in the user zone and an active policy exists.";
        }
        if (q.contains("trigger")) {
            return "Supported triggers are weather, platform outages, and regulatory restrictions.";
        }
        return "ShieldX provides weekly parametric insurance for delivery workers with automated trigger-based payouts.";
    }

    private WeeklyReportResponseDTO fallbackWeeklyReport(WeeklyReportRequestDTO request) {
        List<String> actions = new ArrayList<>();

        if (request.onlineHours() < 35) {
            actions.add("Increase online hours during high-demand time windows for better earnings stability.");
        }
        if (request.disruptionHours() > 8) {
            actions.add("Switch to lower-risk zones when alerts are active to reduce disruption exposure.");
        }
        if (request.completedDeliveries() < 40) {
            actions.add("Target delivery clusters near business districts to raise completion count.");
        }
        if (actions.isEmpty()) {
            actions.add("Performance is steady. Maintain current working pattern and renewal discipline.");
        }

        String summary = "You completed %d deliveries in %d online hours with %d disruption hours. Keep policy coverage active weekly to secure automatic payouts during disruptions."
            .formatted(request.completedDeliveries(), request.onlineHours(), request.disruptionHours());

        return new WeeklyReportResponseDTO(summary, actions);
    }

    private WeeklyReportResponseDTO parseStructuredWeeklyResponse(String remoteText) {
        if (remoteText == null || remoteText.isBlank()) {
            return null;
        }

        try {
            int start = remoteText.indexOf('{');
            int end = remoteText.lastIndexOf('}');
            if (start < 0 || end <= start) {
                return null;
            }

            String json = remoteText.substring(start, end + 1);

            String summary = extractSummary(json);
            if (summary.isBlank()) {
                return null;
            }

            List<String> actions = extractActions(json);

            if (actions.isEmpty()) {
                actions.add("Keep policy active weekly and monitor zone alerts.");
            }

            if (actions.size() > 4) {
                actions = actions.subList(0, 4);
            }

            return new WeeklyReportResponseDTO(summary.trim(), actions);
        } catch (Exception ex) {
            LOGGER.debug("Unable to parse structured weekly AI response. Using fallback.", ex);
            return null;
        }
    }

    private String extractSummary(String json) {
        Pattern pattern = Pattern.compile("\\\"summary\\\"\\s*:\\s*\\\"(.*?)\\\"", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(json);
        if (!matcher.find()) {
            return "";
        }
        return matcher.group(1).replace("\\n", " ").replace("\\\"", "\"").trim();
    }

    private List<String> extractActions(String json) {
        List<String> actions = new ArrayList<>();
        Pattern blockPattern = Pattern.compile("\\\"recommendedActions\\\"\\s*:\\s*\\[(.*?)\\]", Pattern.DOTALL);
        Matcher blockMatcher = blockPattern.matcher(json);
        if (!blockMatcher.find()) {
            return actions;
        }

        String block = blockMatcher.group(1);
        Pattern itemPattern = Pattern.compile("\\\"(.*?)\\\"");
        Matcher itemMatcher = itemPattern.matcher(block);
        while (itemMatcher.find()) {
            String item = itemMatcher.group(1).replace("\\n", " ").replace("\\\"", "\"").trim();
            if (!item.isBlank()) {
                actions.add(item);
            }
        }

        return actions;
    }
}
