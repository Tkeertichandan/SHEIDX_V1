package com.sheildX.proj.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sheildX.proj.model.Claim;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByPolicyIdAndTriggerEventId(Long policyId, Long triggerEventId);
}
