package com.sheildX.proj.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sheildX.proj.model.TriggerEvent;

public interface TriggerEventRepository extends JpaRepository<TriggerEvent, Long> {
    List<TriggerEvent> findByActiveTrue();
    boolean existsByTypeAndZoneAndDescriptionAndActiveTrue(TriggerEvent.TriggerType type, String zone, String description);
}
