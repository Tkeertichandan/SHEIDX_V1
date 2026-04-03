package com.sheildX.proj.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class ClaimAutomationService {

    private final ClaimService claimService;

    public ClaimAutomationService(ClaimService claimService) {
        this.claimService = claimService;
    }

    @Scheduled(fixedDelayString = "${shieldx.claims.auto-process-ms:10000}")
    public void autoProcessClaims() {
        claimService.generateClaimsForActiveTriggers();
    }
}
