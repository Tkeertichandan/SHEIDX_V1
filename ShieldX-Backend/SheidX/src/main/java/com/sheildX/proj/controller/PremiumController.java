package com.sheildX.proj.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.sheildX.proj.dto.PolicyResponseDTO;
import com.sheildX.proj.dto.PremiumCalculationRequestDTO;
import com.sheildX.proj.dto.PremiumResponseDTO;
import com.sheildX.proj.model.Policy;
import com.sheildX.proj.model.UserProfile;
import com.sheildX.proj.service.PolicyService;
import com.sheildX.proj.service.PremiumService;
import com.sheildX.proj.service.UserService;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/premium")
public class PremiumController {

    private final PremiumService premiumService;
    private final UserService userService;
    private final PolicyService policyService;

    public PremiumController(PremiumService premiumService, UserService userService, PolicyService policyService) {
        this.premiumService = premiumService;
        this.userService = userService;
        this.policyService = policyService;
    }

    @PostMapping("/calculate")
    public PremiumResponseDTO calculate(@Valid @RequestBody PremiumCalculationRequestDTO request) {
        UserProfile user = userService.getUser(request.userId());
        return premiumService.calculate(user, request.basePrice());
    }

    @PostMapping("/purchase")
    @ResponseStatus(HttpStatus.CREATED)
    public PolicyResponseDTO purchase(@Valid @RequestBody PremiumCalculationRequestDTO request) {
        UserProfile user = userService.getUser(request.userId());
        PremiumResponseDTO premium = premiumService.calculate(user, request.basePrice());
        Policy policy = policyService.purchasePolicy(user.getId(), premium.premium());
        return new PolicyResponseDTO(
            policy.getId(),
            policy.getUserId(),
            policy.getPremium(),
            policy.getWeekStart(),
            policy.getWeekEnd(),
            policy.getStatus().name()
        );
    }

    @GetMapping("/policies/user/{userId}")
    public List<PolicyResponseDTO> listPoliciesByUser(@PathVariable Long userId) {
        return policyService.getPoliciesByUser(userId).stream().map(policy -> new PolicyResponseDTO(
            policy.getId(),
            policy.getUserId(),
            policy.getPremium(),
            policy.getWeekStart(),
            policy.getWeekEnd(),
            policy.getStatus().name()
        )).toList();
    }
}
