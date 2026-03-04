# Zero Bug & Code Quality Strategy

## 1. Linting
- ESLint (Strict)
- Prettier

## 2. Pre-commit Hooks
- Husky
- Auto-lint before commit

## 3. Testing
- **Unit tests**: Jest (Services and Utils)
- **API tests**: Supertest (Endpoint validation)
- **Specific Logic**: Attendance overlap and Fee calculation tests

## 4. CI/CD
- Run tests before deployment
- Fail build if any test fails

## 5. Logging
- Winston logger for structured logs
- Error tracking with context (User ID, Request ID)

## 6. Code Review
- Mandatory PR review
- Strategic branch protection (main, develop)
