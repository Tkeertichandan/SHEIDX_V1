-- ShieldX Phase 1 MySQL Schema (aligned with current Spring JPA entities)
-- Execute on MySQL 8+

CREATE DATABASE IF NOT EXISTS sheidx;
USE sheidx;

CREATE TABLE IF NOT EXISTS user_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    zone_risk DOUBLE NOT NULL,
    worker_risk_score DOUBLE NOT NULL,
    wallet_balance DOUBLE NOT NULL DEFAULT 0,
    created_at DATETIME(6),
    updated_at DATETIME(6)
);

CREATE TABLE IF NOT EXISTS policy (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    week_start DATE,
    week_end DATE,
    premium DOUBLE NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED') NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    INDEX idx_policy_user_status (user_id, status)
);

CREATE TABLE IF NOT EXISTS trigger_event (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('WEATHER', 'PLATFORM', 'REGULATORY') NOT NULL,
    zone VARCHAR(100) NOT NULL,
    description VARCHAR(300) NOT NULL,
    severity DOUBLE NOT NULL,
    occurred_at DATETIME(6),
    active BIT NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    INDEX idx_trigger_zone_active (zone, active)
);

CREATE TABLE IF NOT EXISTS claim (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    policy_id BIGINT NOT NULL,
    trigger_event_id BIGINT NOT NULL,
    payout DOUBLE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status ENUM('APPROVED', 'REJECTED') NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    UNIQUE KEY uk_claim_policy_trigger (policy_id, trigger_event_id),
    INDEX idx_claim_user_created (user_id, created_at)
);
