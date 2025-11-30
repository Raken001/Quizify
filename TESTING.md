# Testing Guide - Quizify

This guide covers unit tests, integration tests, and end-to-end (E2E) tests for both frontend and backend.

## Quick Start

### Backend Tests
```bash
cd quizify-backend

# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage report
npm test:coverage
```

### Frontend Tests
```bash
cd quizify-frontend

# Run unit tests
npm test

# Run unit tests with coverage
npm test:coverage

# Open Cypress for interactive E2E testing
npm run e2e

# Run E2E tests headlessly
npm run e2e:run
```

---

## Backend Testing (Jest)

### Overview
- **Framework**: Jest with TypeScript support (ts-jest)
- **Database**: MongoDB Memory Server (in-memory for testing)
- **API Testing**: Supertest for HTTP request testing

### Test Structure
```
quizify-backend/src/
├── middleware/__tests__/
│   └── auth.middleware.test.ts
├── models/__tests__/
│   └── User.test.ts
└── routes/__tests__/
    └── auth.routes.test.ts
```

### Running Tests

#### All Tests
```bash
npm test
```

#### Specific Test File
```bash
npm test -- auth.middleware.test.ts
```

#### Watch Mode (auto-rerun on changes)
```bash
npm test:watch
```

#### Coverage Report
```bash
npm test:coverage
```

### Test Categories

#### 1. Unit Tests (Middleware, Models)
**Location**: `src/middleware/__tests__/` and `src/models/__tests__/`

Tests individual functions and classes in isolation.

**Example**:
```typescript
describe('requireAuth middleware', () => {
  it('should accept valid token and set user', () => {
    const validToken = jwt.sign(
      { userId: '123', email: 'test@example.com', role: 'user' },
      JWT_SECRET
    );
    mockReq.headers = { authorization: `Bearer ${validToken}` };

    requireAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect((mockReq as AuthRequest).user?.userId).toBe('123');
  });
});
```

#### 2. Integration Tests (Routes)
**Location**: `src/routes/__tests__/`

Tests complete API flows with database interactions using in-memory MongoDB.

**Example**:
```typescript
describe('POST /auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});
```

### Writing New Backend Tests

1. **Create test file** in `src/<feature>/__tests__/<feature>.test.ts`

2. **Import testing utilities**:
```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
```

3. **Structure your test**:
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Mocking in Backend Tests

**Mock Express Objects**:
```typescript
const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
};
```

**Mock HTTP Requests** (Integration Tests):
```typescript
await request(app)
  .post('/auth/login')
  .send({ email: 'test@example.com', password: 'pass123' });
```

---

## Frontend Testing (Jasmine + Karma)

### Overview
- **Framework**: Jasmine (Angular's built-in testing framework)
- **Test Runner**: Karma
- **HTTP Mocking**: HttpClientTestingModule
- **Component Testing**: Angular Testing Utilities (TestBed, ComponentFixture)

### Test Structure
```
quizify-frontend/src/app/
├── services/
│   ├── auth.service.ts
│   ├── auth.service.spec.ts    ← Unit test
│   ├── quiz.service.ts
│   └── quiz.service.spec.ts    ← Unit test
├── pages/
│   ├── login/
│   │   ├── login.ts
│   │   └── login.spec.ts       ← Component test
│   └── quiz/
│       ├── quiz.ts
│       └── quiz.spec.ts        ← Component test
```

### Running Tests

#### All Unit Tests
```bash
npm test
```

#### Watch Mode
```bash
npm test
# Karma will watch for changes and re-run tests
```

#### Coverage Report
```bash
npm test:coverage
```

#### Single Test File
```bash
npm test -- --include='**/auth.service.spec.ts'
```

### Test Categories

#### 1. Service Tests
**Location**: `src/app/services/*.spec.ts`

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should login user', async () => {
    const loginData = { email: 'test@example.com', password: 'pass123' };
    const mockToken = 'jwt_token';

    const promise = service.login(loginData);

    const req = httpMock.expectOne('http://localhost:8000/auth/login');
    req.flush({ token: mockToken });
    await promise;

    expect(localStorage.getItem('quizify_token')).toBe(mockToken);
  });
});
```

#### 2. Guard Tests
**Location**: `src/app/services/*.guard.spec.ts`

```typescript
describe('AuthGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: spy }]
    });
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should allow access when logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => AuthGuard(null as any, null as any));
    expect(result).toBe(true);
  });
});
```

#### 3. Component Tests
**Location**: `src/app/pages/*/*.spec.ts`

```typescript
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: AuthService, useValue: authSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call auth.login on form submit', () => {
    const form = { email: 'test@example.com', password: 'pass123' };
    authService.login.and.returnValue(Promise.resolve());

    component.onSubmit(form);

    expect(authService.login).toHaveBeenCalledWith(form);
  });
});
```

### Common Testing Patterns

#### Testing HTTP Calls
```typescript
it('should fetch users', () => {
  service.getUsers().subscribe(users => {
    expect(users.length).toBe(2);
  });

  const req = httpMock.expectOne('http://api/users');
  expect(req.request.method).toBe('GET');
  req.flush([{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }]);
});
```

#### Testing Observables
```typescript
it('should emit auth state', (done) => {
  service.authStateChanged$.subscribe(state => {
    expect(state).toBe(true);
    done();
  });
  service.login({ email: 'test@example.com', password: 'pass' });
});
```

#### Mocking Services
```typescript
const mockService = jasmine.createSpyObj('ServiceName', ['method1', 'method2']);
mockService.method1.and.returnValue(mockValue);

TestBed.configureTestingModule({
  providers: [{ provide: ServiceName, useValue: mockService }]
});
```

---

## End-to-End Testing (Cypress)

### Overview
- **Framework**: Cypress
- **Location**: `cypress/e2e/`
- **Browser**: Chrome (default)
- **Real Testing**: Tests actual user workflows against running app

### Running E2E Tests

#### Interactive Mode (Opens Cypress UI)
```bash
npm run e2e
```

#### Headless Mode (CI/CD)
```bash
npm run e2e:run
```

#### Run Specific Test
```bash
npm run e2e:run -- --spec "cypress/e2e/auth.cy.ts"
```

### Test Structure
```
quizify-frontend/cypress/
├── e2e/
│   ├── auth.cy.ts          ← Auth flows
│   └── quiz.cy.ts          ← Quiz flows
├── support/
│   ├── commands.ts         ← Custom commands
│   ├── e2e.ts             ← Global setup
│   └── commands.d.ts      ← Type definitions
└── fixtures/
    └── (test data)
```

### Writing E2E Tests

#### Basic Test Structure
```typescript
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
  });
});
```

#### Custom Commands
**File**: `cypress/support/commands.ts`

```typescript
Cypress.Commands.add('loginViaUI', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Usage:
cy.loginViaUI('test@example.com', 'password123');
```

#### Common Cypress Commands
```typescript
// Navigation
cy.visit('/login');
cy.url().should('include', '/dashboard');

// Element Selection & Interaction
cy.get('button').click();
cy.get('input[type="email"]').type('test@example.com');
cy.get('select').select(0);

// Assertions
cy.get('h1').should('contain', 'Login');
cy.get('.error').should('be.visible');
cy.get('button').should('be.disabled');

// Waiting
cy.get('element').should('exist');
cy.wait(1000);
```

### Before Running E2E Tests

1. **Start Backend**:
```bash
cd quizify-backend
npm run start:dev
```

2. **Start Frontend** (in another terminal):
```bash
cd quizify-frontend
npm start
```

3. **Seed Test Data** (optional):
Create test users through registration flow or via API

4. **Run Tests**:
```bash
npm run e2e:run
```

---

## Testing Best Practices

### 1. Test Naming
```typescript
// ✅ Good: Describes what is being tested and expected outcome
it('should redirect unauthenticated users to login page')

// ❌ Bad: Vague
it('should redirect users')
```

### 2. Test Organization
```typescript
// ✅ Good: Arrange-Act-Assert pattern
it('should calculate total correctly', () => {
  // Arrange
  const items = [1, 2, 3];
  
  // Act
  const total = sum(items);
  
  // Assert
  expect(total).toBe(6);
});
```

### 3. Mock External Dependencies
```typescript
// ✅ Good: Isolate what you're testing
beforeEach(() => {
  const httpMock = jasmine.createSpyObj('HttpClient', ['post']);
  TestBed.configureTestingModule({
    providers: [{ provide: HttpClient, useValue: httpMock }]
  });
});

// ❌ Bad: Depends on real API
service.login({ email, password }); // Makes real HTTP call
```

### 4. Test Coverage Goals
- **Statements**: Aim for >80%
- **Branches**: Aim for >75%
- **Functions**: Aim for >80%
- **Lines**: Aim for >80%

Check coverage:
```bash
# Backend
cd quizify-backend && npm test:coverage

# Frontend
cd quizify-frontend && npm test:coverage
```

### 5. Async Test Handling

**Backend**:
```typescript
it('should async operation', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});
```

**Frontend**:
```typescript
it('should handle async', (done) => {
  service.method().subscribe(() => {
    expect(true).toBe(true);
    done();
  });
});

// Or with async/await (modern)
it('should handle async', async () => {
  const result = await service.promiseMethod();
  expect(result).toBeDefined();
});
```

---

## CI/CD Integration

### Running All Tests
```bash
# Backend
cd quizify-backend && npm test

# Frontend
cd quizify-frontend
npm test:coverage
npm run e2e:run
```

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd quizify-backend && npm install && npm test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd quizify-frontend && npm install
      - run: npm test:coverage
      - run: npm run e2e:run
```

---

## Troubleshooting

### Backend Tests Failing

**Issue**: `Cannot find module X`
- Solution: Check imports use `.js` extension and module mapper in jest.config.cjs

**Issue**: MongoDB connection errors
- Solution: Tests use MongoMemoryServer, ensure it's running (no external DB needed)

### Frontend Tests Failing

**Issue**: `Cannot find name 'describe'`
- Solution: Ensure `@types/jasmine` is installed

**Issue**: `HttpTestingController` verification fails
- Solution: Call `httpMock.verify()` in `afterEach`

### E2E Tests Failing

**Issue**: `cy.visit()` times out
- Solution: Ensure `npm start` is running on port 4200

**Issue**: Element not found
- Solution: Add `cy.wait(500)` or use `cy.get(...).should('exist')`

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Cypress Documentation](https://docs.cypress.io/)

---

## Contributing Tests

When adding new features:
1. Write tests first (TDD approach) or alongside code
2. Ensure tests pass: `npm test`
3. Check coverage: `npm test:coverage`
4. Add E2E tests for user workflows
5. Update this documentation if adding new test patterns
