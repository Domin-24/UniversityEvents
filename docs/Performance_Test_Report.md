# Performance Test Report (Baseline)

## Scope
Baseline API responsiveness for core backend routes in local development.

## Test Environment
- Machine: Developer laptop (Windows)
- Runtime: Node.js 20.x
- API: Express backend on port 5001
- DB: local MySQL container

## Method
- Manual repeated requests using PowerShell `Invoke-RestMethod`
- Functional smoke flow repeated multiple times
- Not a full load/stress benchmark

## Observations
- Health endpoint (`GET /api/health`) responds consistently fast.
- Auth flow (`/api/auth/register`, `/api/auth/login`) stable under repeated manual calls.
- End-to-end scenario (register users -> create event -> approve -> register event) completed successfully in sequence.

## Bottlenecks Identified
- No dedicated indexing optimization review yet for heavier event listing queries.
- Registration path uses transaction (correct for consistency) and may need tuning under high concurrency.

## Recommendations (Next Iteration)
1. Add k6 or Artillery benchmark script for reproducible latency metrics.
2. Measure p50/p95 response time for auth/events/approvals endpoints.
3. Add DB indexes review for large datasets (events, registrations).
4. Run performance test in CI nightly pipeline.

## Current Status
- Baseline functional performance: PASS
- Formal load test: PENDING
