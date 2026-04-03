package com.sheildX.proj.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sheildX.proj.model.Policy;
import com.sheildX.proj.repository.PolicyRepository;

@Service
public class PolicyService {

    private final PolicyRepository policyRepository;

    public PolicyService(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    public Policy purchasePolicy(Long userId, double premium) {
        LocalDate now = LocalDate.now();
        Policy policy = new Policy(userId, now, now.plusDays(6), premium, Policy.Status.ACTIVE);
        return policyRepository.save(policy);
    }

    public Policy getActivePolicy(Long userId) {
        return policyRepository.findFirstByUserIdAndStatusOrderByWeekStartDesc(userId, Policy.Status.ACTIVE)
            .orElseThrow(() -> new IllegalArgumentException("No active policy for user id: " + userId));
    }

    public List<Policy> getActivePolicies() {
        return policyRepository.findByStatus(Policy.Status.ACTIVE);
    }

    public List<Policy> getPoliciesByUser(Long userId) {
        return policyRepository.findByUserIdOrderByWeekStartDesc(userId);
    }
}
