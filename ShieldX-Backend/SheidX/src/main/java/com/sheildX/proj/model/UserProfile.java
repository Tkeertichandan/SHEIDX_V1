package com.sheildX.proj.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Entity
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String city;
    private String zone;
    private double zoneRisk;
    private double workerRiskScore;
    private double walletBalance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected UserProfile() {
    }

    public UserProfile(String name, String city, String zone, double zoneRisk, double workerRiskScore) {
        this.name = name;
        this.city = city;
        this.zone = zone;
        this.zoneRisk = zoneRisk;
        this.workerRiskScore = workerRiskScore;
        this.walletBalance = 0.0;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCity() {
        return city;
    }

    public String getZone() {
        return zone;
    }

    public double getZoneRisk() {
        return zoneRisk;
    }

    public double getWorkerRiskScore() {
        return workerRiskScore;
    }

    public double getWalletBalance() {
        return walletBalance;
    }

    public void setWalletBalance(double walletBalance) {
        this.walletBalance = walletBalance;
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
