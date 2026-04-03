package com.sheildX.proj.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.sheildX.proj.dto.AutomatedTriggerSignalDTO;
import com.sheildX.proj.dto.TriggerEventRequestDTO;
import com.sheildX.proj.model.TriggerEvent;
import com.sheildX.proj.repository.TriggerEventRepository;

@Service
public class TriggerService {

    private static final Logger log = LoggerFactory.getLogger(TriggerService.class);

    private final TriggerEventRepository triggerEventRepository;

    public TriggerService(TriggerEventRepository triggerEventRepository) {
        this.triggerEventRepository = triggerEventRepository;
    }

    public TriggerEvent createTrigger(TriggerEventRequestDTO request) {
        TriggerEvent.TriggerType type = TriggerEvent.TriggerType.valueOf(request.type().toUpperCase());
        log.info("Creating trigger type={} zone={} severity={}", type, request.zone(), request.severity());
        TriggerEvent event = new TriggerEvent(
            type,
            request.zone(),
            request.description(),
            request.severity(),
            LocalDateTime.now(),
            true
        );
        return triggerEventRepository.save(event);
    }

    public TriggerEvent createAutomatedTrigger(AutomatedTriggerSignalDTO signal) {
        boolean duplicateActive = triggerEventRepository.existsByTypeAndZoneAndDescriptionAndActiveTrue(
            signal.type(),
            signal.zone(),
            signal.description()
        );
        if (duplicateActive) {
            return null;
        }

        TriggerEvent event = new TriggerEvent(
            signal.type(),
            signal.zone(),
            signal.description(),
            signal.severity(),
            LocalDateTime.now(),
            true
        );
        log.info("Auto-created trigger type={} zone={} severity={}", signal.type(), signal.zone(), signal.severity());
        return triggerEventRepository.save(event);
    }

    public List<TriggerEvent> getAllTriggers() {
        return triggerEventRepository.findAll();
    }

    public List<TriggerEvent> getActiveTriggers() {
        return triggerEventRepository.findByActiveTrue();
    }

    public void resolveTrigger(Long triggerId) {
        log.info("Resolving trigger id={}", triggerId);
        TriggerEvent event = triggerEventRepository.findById(triggerId)
            .orElseThrow(() -> new IllegalArgumentException("Trigger not found for id: " + triggerId));
        event.setActive(false);
        triggerEventRepository.save(event);
    }
}
