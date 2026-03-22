# D3 Test Plan — University Event Management System

## 1. Test Objective
- Verify core backend API behavior for authentication, event lifecycle, approvals, and student registration.
- Ensure role-based authorization is enforced correctly.
- Maintain automated regression safety net with coverage target >= 80% (scope: critical modules).

## 2. Scope
- In scope:
  - Unit tests: validators, JWT utility, role middleware.
  - Integration tests: auth, events, approvals, registrations, health route.
- Out of scope (D4+):
  - Browser end-to-end UI automation.
  - Load testing at production-scale traffic.

## 3. Test Types
- Unit Testing (Jest)
- Integration Testing (Jest + Supertest)
- Static Lint Check (ESLint)

## 4. Test Environment
- Node.js: 20.x
- Test runner: Jest 29
- HTTP test client: Supertest
- DB dependency in integration tests: mocked via Jest module mocks
- OS: Windows / Ubuntu (GitHub Actions)

## 5. Entry Criteria
- Backend dependencies installed (`npm ci`)
- Test scripts available in backend/package.json
- Jest configuration ready (`backend/jest.config.js`)

## 6. Exit Criteria
- All test suites pass
- No blocking lint errors
- Coverage report generated (`coverage/`)
- Critical regression checks passed:
  - Unauthorized requests return 401
  - Forbidden role access returns 403
  - Validation errors return 400

## 7. Test Execution Commands
```bash
cd backend
npm run test:unit
npm run test:integration
npm run test:coverage
npm run lint
```

## 8. Risks and Mitigations
- Risk: Integration tests coupled to real DB state
  - Mitigation: mock DB module in integration suite.
- Risk: false confidence on heavy SQL branches
  - Mitigation: add repository/service layer tests with DB container in next phase.

## 9. Deliverables
- Test source files in `backend/tests/`
- Jest config in `backend/jest.config.js`
- Coverage artifacts in `coverage/`
- D3 documentation set in `docs/`
