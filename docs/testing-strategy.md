# ShieldX Testing Strategy

## Backend Tests
- Unit tests should cover pure business logic in services.
- Integration tests should validate authentication, authorization, and API contracts.
- Current integration coverage includes:
  - Auth login token issuance
  - Protected route rejection without token

## Frontend Tests
- Component tests should validate rendering states: loading, empty, success, and error.
- Integration tests should validate authenticated app flow:
  - Login
  - Data fetch with token
  - Token refresh on expiry
- E2E tests should validate full policy and claim flow using Playwright or Cypress.

## CI Enforcement
- Backend: `./mvnw -q test`
- Frontend: `npm ci && npm run build`

## Recommended Next Additions
- Contract tests between frontend API client and backend OpenAPI schema.
- Load testing for trigger/claim processing throughput.
- Security tests for JWT tampering and refresh token replay attempts.
