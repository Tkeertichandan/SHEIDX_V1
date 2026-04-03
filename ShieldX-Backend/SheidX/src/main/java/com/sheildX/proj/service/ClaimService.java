package com.sheildX.proj.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.sheildX.proj.model.Claim;
import com.sheildX.proj.model.Policy;
import com.sheildX.proj.model.TriggerEvent;
import com.sheildX.proj.model.UserProfile;
import com.sheildX.proj.repository.ClaimRepository;

@Service
public class ClaimService {

    private static final Logger log = LoggerFactory.getLogger(ClaimService.class);

    private final ClaimRepository claimRepository;
    private final PolicyService policyService;
    private final TriggerService triggerService;
    private final UserService userService;

    public ClaimService(
        ClaimRepository claimRepository,
        PolicyService policyService,
        TriggerService triggerService,
        UserService userService
    ) {
        this.claimRepository = claimRepository;
        this.policyService = policyService;
        this.triggerService = triggerService;
        this.userService = userService;
    }

    public List<Claim> generateClaimsForActiveTriggers() {
        List<Claim> created = new ArrayList<>();
        List<Policy> activePolicies = policyService.getActivePolicies();
        List<TriggerEvent> activeTriggers = triggerService.getActiveTriggers();

        log.debug("Running claim generation for activePolicies={} activeTriggers={}", activePolicies.size(), activeTriggers.size());

        for (Policy policy : activePolicies) {
            UserProfile user = userService.getUser(policy.getUserId());
            for (TriggerEvent trigger : activeTriggers) {
                if (!trigger.getZone().equalsIgnoreCase(user.getZone())) {
                    continue;
                }
                if (claimRepository.existsByPolicyIdAndTriggerEventId(policy.getId(), trigger.getId())) {
                    continue;
                }
                double payout = round(policy.getPremium() * (1.2 + trigger.getSeverity()));
                Claim claim = new Claim(
                    user.getId(),
                    policy.getId(),
                    trigger.getId(),
                    payout,
                    "Auto-generated due to " + trigger.getType() + " trigger",
                    Claim.Status.APPROVED,
                    LocalDateTime.now()
                );
                Claim saved = claimRepository.save(claim);
                user.setWalletBalance(round(user.getWalletBalance() + payout));
                userService.save(user);
                created.add(saved);
                log.info("Generated claim id={} userId={} triggerId={} payout={}", saved.getId(), user.getId(), trigger.getId(), payout);
            }
        }

        if (!created.isEmpty()) {
            log.info("Claim generation completed with {} new claim(s)", created.size());
        }
        return created;
    }

    public List<Claim> getClaimsByUser(Long userId) {
        return claimRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
