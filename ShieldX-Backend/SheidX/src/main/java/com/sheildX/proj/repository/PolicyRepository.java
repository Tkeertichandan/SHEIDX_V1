package com.sheildX.proj.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sheildX.proj.model.Policy;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    Optional<Policy> findFirstByUserIdAndStatusOrderByWeekStartDesc(Long userId, Policy.Status status);
    List<Policy> findByStatus(Policy.Status status);
    List<Policy> findByUserIdOrderByWeekStartDesc(Long userId);
}
