package com.sheildX.proj.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Entity
public class TriggerEvent {

    public enum TriggerType {
        WEATHER,
        PLATFORM,
        REGULATORY
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TriggerType type;

    private String zone;
    private String description;
    private double severity;
    private LocalDateTime occurredAt;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected TriggerEvent() {
    }

    public TriggerEvent(TriggerType type, String zone, String description, double severity, LocalDateTime occurredAt, boolean active) {
        this.type = type;
        this.zone = zone;
        this.description = description;
        this.severity = severity;
        this.occurredAt = occurredAt;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public TriggerType getType() {
        return type;
    }

    public String getZone() {
        return zone;
    }

    public String getDescription() {
        return description;
    }

    public double getSeverity() {
        return severity;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
