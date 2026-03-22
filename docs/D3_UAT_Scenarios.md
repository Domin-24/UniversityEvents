# D3 UAT Scenarios

## UAT-01 Student registration journey
- Actor: STUDENT
- Preconditions:
  - Student account exists.
  - At least one APPROVED and OPEN event exists.
- Steps:
  1. Login as student.
  2. Open dashboard event list.
  3. Click register on an open event.
  4. Open "My registrations" section.
- Expected:
  - Registration success message appears.
  - Event appears in student registration history.

## UAT-02 Lecturer approval workflow
- Actor: LECTURER
- Preconditions:
  - At least one event in PENDING status.
- Steps:
  1. Login as lecturer.
  2. Open approval queue.
  3. Approve event with remark.
- Expected:
  - Event status changes from PENDING to APPROVED.
  - Event appears in public event list.

## UAT-03 Role-based access control
- Actor: STUDENT / LECTURER
- Preconditions: Valid tokens for both roles.
- Steps:
  1. Attempt to create event with student token.
  2. Attempt to register event with lecturer token.
- Expected:
  - Both actions are blocked with Forbidden message.

## UAT-04 Cancel registration
- Actor: STUDENT
- Preconditions:
  - Student is already REGISTERED for an event.
- Steps:
  1. Open registration history.
  2. Click cancel registration.
- Expected:
  - Status changes to CANCELLED.
  - Event slot becomes available again when applicable.

## UAT-05 Authentication guard
- Actor: Anonymous user
- Preconditions: None
- Steps:
  1. Access protected endpoints without token.
- Expected:
  - Server returns Unauthorized (401).
