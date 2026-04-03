package com.sheildX.proj.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.sheildX.proj.dto.PremiumResponseDTO;
import com.sheildX.proj.model.UserProfile;

@Service
public class PremiumService {

    public PremiumResponseDTO calculate(UserProfile user, double basePrice) {
        double basePremium = basePrice * user.getZoneRisk() * user.getWorkerRiskScore();
        double aiAdjustment = getAiAdjustment(user, basePrice);
        double premium = round(Math.max(25, basePremium + aiAdjustment));
        return new PremiumResponseDTO(
            user.getId(),
            basePrice,
            user.getZoneRisk(),
            user.getWorkerRiskScore(),
            premium
        );
    }

    private double getAiAdjustment(UserProfile user, double basePrice) {
        String zone = user.getZone() == null ? "" : user.getZone().toUpperCase(Locale.ROOT);

        // Zone history incentive: safe zones get flat Rs.2 weekly reduction.
        if (zone.contains("SAFE") || zone.contains("WEST")) {
            return -2.0;
        }

        // Predictive weather risk: higher-risk zones get proportional surcharge.
        if (zone.contains("COAST") || zone.contains("FLOOD") || zone.contains("CENTRAL")) {
            return round(basePrice * 0.03);
        }

        return 0.0;
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
