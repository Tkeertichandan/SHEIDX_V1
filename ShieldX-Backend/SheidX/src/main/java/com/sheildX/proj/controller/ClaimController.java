package com.sheildX.proj.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sheildX.proj.dto.ClaimResponseDTO;
import com.sheildX.proj.model.Claim;
import com.sheildX.proj.service.ClaimService;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping("/process")
    public List<ClaimResponseDTO> processClaims() {
        return claimService.generateClaimsForActiveTriggers().stream().map(this::toResponse).toList();
    }

    @GetMapping("/user/{userId}")
    public List<ClaimResponseDTO> getClaimsByUser(@PathVariable Long userId) {
        return claimService.getClaimsByUser(userId).stream().map(this::toResponse).toList();
    }

    private ClaimResponseDTO toResponse(Claim claim) {
        return new ClaimResponseDTO(
            claim.getId(),
            claim.getUserId(),
            claim.getPolicyId(),
            claim.getTriggerEventId(),
            claim.getPayout(),
            claim.getReason(),
            claim.getStatus().name(),
            claim.getCreatedAt()
        );
    }
}
