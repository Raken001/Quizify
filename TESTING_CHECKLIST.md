# Testing Checklist

Use this checklist when developing new features or fixing bugs.

## Before Committing Code

### Backend
- [ ] Run `npm test` - All tests passing
- [ ] Run `npm test:coverage` - Check coverage ≥ 80%
- [ ] New feature has unit tests
- [ ] Error cases are tested
- [ ] Integration tests for API routes
- [ ] No console.log or debug statements left

### Frontend
- [ ] Run `npm test` - All unit tests passing
- [ ] Run `npm test:coverage` - Check coverage ≥ 80%
- [ ] New service has tests
- [ ] New component has tests
- [ ] Error handling is tested
- [ ] Observable subscriptions tested

### E2E
- [ ] Start both frontend and backend servers
- [ ] Run `npm run e2e:run` - All E2E tests passing
- [ ] Key user flows have E2E tests
- [ ] Form validations tested

## Writing New Tests

### For a New Service
- [ ] Create `src/app/services/name.service.spec.ts`
- [ ] Test all public methods
- [ ] Mock dependencies
- [ ] Test error cases
- [ ] Test observables/promises

### For a New Component
- [ ] Create `src/app/pages/name/name.spec.ts`
- [ ] Test component creation
- [ ] Test template rendering
- [ ] Test user interactions
- [ ] Test event emissions
- [ ] Test form submissions

### For a New Route/Endpoint
- [ ] Create `src/routes/__tests__/name.routes.test.ts`
- [ ] Test successful flow
- [ ] Test validation errors
- [ ] Test not found errors
- [ ] Test unauthorized access
- [ ] Test database operations

### For a New Middleware
- [ ] Create `src/middleware/__tests__/name.middleware.test.ts`
- [ ] Test valid input
- [ ] Test invalid input
- [ ] Test error responses
- [ ] Test next() calls

## Test Coverage Goals

| Area | Target |
|------|--------|
| Statements | ≥ 80% |
| Branches | ≥ 75% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

Check coverage:
```bash
# Backend
cd quizify-backend && npm test:coverage

# Frontend
cd quizify-frontend && npm test:coverage
```

## Common Test Scenarios

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Register with duplicate email
- [ ] Register with weak password
- [ ] Logout clears token
- [ ] Protected routes redirect to login

### Forms
- [ ] Submit with valid data
- [ ] Submit with missing fields
- [ ] Email format validation
- [ ] Password strength validation
- [ ] Show/hide errors appropriately
- [ ] Clear errors on correction

### Lists/Tables
- [ ] Display items
- [ ] Empty state
- [ ] Pagination
- [ ] Filtering
- [ ] Sorting
- [ ] Edit item
- [ ] Delete item
- [ ] Bulk operations

### API Integration
- [ ] Successful requests
- [ ] Error responses
- [ ] Network timeouts
- [ ] Invalid data handling
- [ ] Token expiration
- [ ] Retry logic

## Before Pushing

```bash
# Backend
cd quizify-backend
npm test              # All tests pass?
npm test:coverage     # Coverage > 80%?
npm run type-check    # No TypeScript errors?
npm run build         # Builds without errors?

# Frontend
cd quizify-frontend
npm test              # All tests pass?
npm test:coverage     # Coverage > 80%?
npm run build         # Builds without errors?

# E2E (optional, if servers are running)
npm run e2e:run       # All E2E tests pass?
```

## Troubleshooting

### Tests Failing?
1. Check error message carefully
2. Run single test: `npm test -- test-name`
3. Check recent code changes
4. Look for async/timing issues
5. Check mock setup

### Coverage Low?
1. Identify uncovered lines: `npm test:coverage`
2. Add tests for those lines
3. Consider if code can be simplified
4. Check error paths are tested

### Tests Running Slow?
1. Check for unnecessary waits/delays
2. Use mocks instead of real dependencies
3. Optimize test setup/teardown
4. Run only relevant tests during development

## Tips

- **Rename tests** if they fail - unclear what they test
- **Write tests first** (TDD) for new features
- **Keep tests simple** - they should be readable
- **Run tests often** - catch issues early
- **Don't ignore failing tests** - fix them immediately
- **Refactor with confidence** - tests catch regressions

## Resources

- Backend: `TESTING.md` - Full testing guide
- Frontend: `TESTING.md` - Full testing guide
- Examples: `TEST_EXAMPLES.md` - Code examples
- Summary: `TEST_SETUP_SUMMARY.md` - What was set up

---

Last Updated: November 29, 2025
