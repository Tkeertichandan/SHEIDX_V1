# ShieldX Deployment Guide

## Local Deployment with Docker Compose
1. From repository root, run `docker compose up --build`.
2. Frontend: `http://localhost:5173`
3. Backend API: `http://localhost:9999/api`
4. Swagger UI: `http://localhost:9999/swagger-ui/index.html`

## Kubernetes Deployment
1. Create secret `shieldx-secrets` for DB and JWT values.
2. Apply manifests:
   - `kubectl apply -f deploy/k8s/mysql-statefulset.yaml`
   - `kubectl apply -f deploy/k8s/backend-deployment.yaml`
   - `kubectl apply -f deploy/k8s/frontend-deployment.yaml`
   - `kubectl apply -f deploy/k8s/ingress.yaml`

## AWS Production Pattern
- ECR for container images
- EKS for Kubernetes orchestration
- RDS MySQL for managed database
- ALB Ingress Controller for ingress
- AWS Secrets Manager for JWT and DB secrets
- CloudWatch for logs and metrics

## Required Environment Variables
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
