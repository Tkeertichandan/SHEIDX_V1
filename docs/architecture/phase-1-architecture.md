# ShieldX Enterprise Architecture (Phase 1)

## Application Idea
ShieldX is an enterprise-grade micro-insurance platform for gig delivery workers. It supports policy purchase, trigger ingestion, automatic claim processing, and AI-assisted guidance.

## Tech Stack Chosen
- Frontend: React (existing ShieldX-Frontend)
- Backend: Spring Boot 4 (existing ShieldX-Backend)
- Database: MySQL 8+
- API Style: REST + JSON

## Backend Layered Architecture
- `controller`: HTTP boundary and request validation
- `service`: business logic and orchestration
- `repository`: persistence abstraction with Spring Data JPA
- `model`: JPA entities
- `dto`: request/response contracts
- `config`: CORS and app-wide technical configuration

## Core Business Modules
- User Profile module
- Premium & Policy module
- Trigger Event module
- Claim Automation module
- AI Advisory module

## Reliability and Operations
- Centralized exception handling via `ApiExceptionHandler`
- Bean validation for all incoming request DTOs
- Service-level structured logging (info/debug)
- Scheduled job for automatic claim generation

## Non-Functional Baseline
- Horizontal scalability via stateless REST services
- Data consistency with JPA repositories and transactions
- Clear separation of concerns for maintainability
- Backend contract compatibility with existing frontend

## API Naming Strategy
- Version-ready route strategy: `/api/<module>`
- Current modules:
  - `/api/users`
  - `/api/premium`
  - `/api/triggers`
  - `/api/claims`
  - `/api/ai`

## Phase 1 Completion Notes
Phase 1 intentionally keeps endpoint shapes backward-compatible while hardening internals. Authentication, advanced RBAC, and CI/CD are planned for later phases.
