# D3 Test Cases

| Test Case ID | Type | Description | Input | Expected Output | Status |
|---|---|---|---|---|---|
| TC-AUTH-001 | Unit | Register schema accepts valid payload | name/email/password | Parsed object with default role STUDENT | Ready |
| TC-AUTH-002 | Unit | Register schema rejects invalid email | email=bad | Validation error thrown | Ready |
| TC-AUTH-003 | Unit | Login schema rejects empty password | password='' | Validation error thrown | Ready |
| TC-EVT-001 | Unit | Event schema accepts valid ISO eventDate | valid payload | Parsed object | Ready |
| TC-EVT-002 | Unit | Event schema rejects non-ISO date | eventDate='01/04/2026' | Validation error thrown | Ready |
| TC-EVT-003 | Unit | Event schema rejects non-integer participants | maxParticipants=2.5 | Validation error thrown | Ready |
| TC-APP-001 | Unit | Approval schema accepts APPROVED | status=APPROVED | Parsed object | Ready |
| TC-PARAM-001 | Unit | eventId param coerces numeric string | eventId='12' | eventId number 12 | Ready |
| TC-JWT-001 | Unit | Signed token can be verified | payload userId/role | jwt.verify returns same claims | Ready |
| TC-ROLE-001 | Unit | Role middleware allows allowed role | ADMIN in allowed list | next() called without error | Ready |
| TC-ROLE-002 | Unit | Role middleware blocks missing user | req.user undefined | ApiError 403 | Ready |
| TC-ROLE-003 | Unit | Role middleware blocks disallowed role | STUDENT for admin route | ApiError 403 | Ready |
| TC-INT-HEALTH-001 | Integration | Health endpoint responds success | GET /api/health | 200, success=true | Ready |
| TC-INT-ROUTE-404 | Integration | Unknown route returns not found | GET /api/not-exists | 404, Route not found | Ready |
| TC-INT-AUTH-REG-001 | Integration | Register rejects invalid payload | POST /api/auth/register | 400 | Ready |
| TC-INT-AUTH-REG-002 | Integration | Register blocks duplicate email | existing user mock | 409 | Ready |
| TC-INT-AUTH-LOGIN-001 | Integration | Login fails on unknown user | empty user rows | 401 | Ready |
| TC-INT-AUTH-LOGIN-002 | Integration | Login succeeds with valid credentials | bcrypt hash mock row | 200 + token | Ready |
| TC-INT-EVT-001 | Integration | Public event list returns data | GET /api/events | 200 + array | Ready |
| TC-INT-EVT-002 | Integration | Create event requires auth | POST /api/events no token | 401 | Ready |
| TC-INT-EVT-003 | Integration | Student cannot create event | STUDENT token | 403 | Ready |
| TC-INT-EVT-004 | Integration | Lecturer can create event | LECTURER token + payload | 201 + eventId | Ready |
| TC-INT-REG-001 | Integration | Register route requires auth | POST /api/events/1/register no token | 401 | Ready |
| TC-INT-REG-002 | Integration | Lecturer cannot register to event | LECTURER token | 403 | Ready |
| TC-INT-REG-003 | Integration | Student can fetch own registrations | GET /api/events/registrations/me | 200 + list | Ready |
| TC-INT-APR-001 | Integration | Student cannot access pending approvals | GET /api/approvals/pending | 403 | Ready |
| TC-INT-APR-002 | Integration | Lecturer can access pending approvals | LECTURER token | 200 + list | Ready |
| TC-INT-APR-003 | Integration | Invalid approval eventId rejected | PATCH /api/approvals/not-a-number | 400 | Ready |
