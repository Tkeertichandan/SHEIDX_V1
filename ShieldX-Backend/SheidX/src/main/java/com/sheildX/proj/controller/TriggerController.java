package com.sheildX.proj.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.sheildX.proj.dto.TriggerEventRequestDTO;
import com.sheildX.proj.dto.TriggerEventResponseDTO;
import com.sheildX.proj.model.TriggerEvent;
import com.sheildX.proj.service.TriggerService;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/triggers")
public class TriggerController {

    private final TriggerService triggerService;

    public TriggerController(TriggerService triggerService) {
        this.triggerService = triggerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TriggerEventResponseDTO create(@Valid @RequestBody TriggerEventRequestDTO request) {
        return toResponse(triggerService.createTrigger(request));
    }

    @GetMapping
    public List<TriggerEventResponseDTO> list(@RequestParam(defaultValue = "false") boolean activeOnly) {
        List<TriggerEvent> source = activeOnly ? triggerService.getActiveTriggers() : triggerService.getAllTriggers();
        return source.stream().map(this::toResponse).toList();
    }

    @PatchMapping("/{id}/resolve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resolve(@PathVariable Long id) {
        triggerService.resolveTrigger(id);
    }

    private TriggerEventResponseDTO toResponse(TriggerEvent event) {
        return new TriggerEventResponseDTO(
            event.getId(),
            event.getType().name(),
            event.getZone(),
            event.getDescription(),
            event.getSeverity(),
            event.getOccurredAt(),
            event.isActive()
        );
    }
}
