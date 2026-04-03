# ShieldX Enterprise Full-Stack Platform

ShieldX is a production-ready insurance operations platform for gig delivery workers with real-time claims processing, role-based security, analytics, and AI-assisted guidance.

## Phase Delivery Status
- Phase 1: Architecture, database, backend hardening
- Phase 2: Frontend architecture, context state, modern UX, API integration
- Phase 3: Security, testing, DevOps, deployment, optimization

## Tech Stack
- Frontend: React + Vite
- Backend: Spring Boot 4 + Spring Security + JWT
- Database: MySQL
- API Docs: OpenAPI/Swagger
- CI/CD: GitHub Actions
- Containers: Docker + Kubernetes manifests

## Project Structure
- `ShieldX-Backend/SheidX`: Spring Boot backend
- `ShieldX-Frontend/ShieldX`: React frontend
- `deploy/k8s`: Kubernetes manifests
- `docs`: architecture, database, testing, and deployment docs

## Security Model
- JWT access tokens
- Refresh token rotation with persistence
- RBAC roles: `ADMIN`, `OPERATOR`
- Protected API routes with role-based restrictions

## Default Bootstrap Admin
- Username: `admin`
- Password: `Admin@12345`
- Change immediately in production using environment variables.

## Local Run (Without Containers)
### Backend
1. Create DB: `mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sheidx;"`
2. Run: `cd ShieldX-Backend/SheidX && ./mvnw spring-boot:run`

### Frontend
1. Run: `cd ShieldX-Frontend/ShieldX && npm install && npm run dev`
2. Open: `http://localhost:5173`

## Docker Run
- `docker compose up --build`

## CI
Workflow file: `.github/workflows/ci.yml`
- Backend test job runs Maven tests
- Frontend job installs dependencies and builds production bundle

## API Docs
- Swagger UI: `http://localhost:9999/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:9999/v3/api-docs`

## Testing
- Backend tests: `cd ShieldX-Backend/SheidX && ./mvnw -q test`
- Frontend build validation: `cd ShieldX-Frontend/ShieldX && npm run build`
- Detailed strategy: `docs/testing-strategy.md`

## Future Scalability Improvements
1. Introduce Redis cache for high-read endpoints.
2. Add message queue (Kafka/SQS) for trigger ingestion and async claim workflows.
3. Split AI module into independent service with rate limiting.
4. Add S3-backed document upload workflow for claim evidence.
5. Add tenant isolation for multi-organization support.
6. Add observability stack with OpenTelemetry and distributed tracing.
