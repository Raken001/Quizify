# Test Examples & Patterns

Quick reference for writing tests in your Quizify project.

## Backend Test Examples (Jest)

### 1. Testing Middleware

```typescript
// src/middleware/__tests__/your-middleware.test.ts
import { yourMiddleware } from '../your-middleware';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/types';

describe('YourMiddleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  it('should pass to next() on valid input', () => {
    mockReq.someProperty = 'valid';
    
    yourMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 400 on invalid input', () => {
    mockReq.someProperty = null;
    
    yourMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
```

### 2. Testing Models/Schemas

```typescript
// src/models/__tests__/YourModel.test.ts
import mongoose from 'mongoose';
import { YourSchema } from '../YourModel';

describe('YourModel Schema', () => {
  const YourModel = mongoose.model('YourModel', YourSchema);

  it('should validate required fields', () => {
    const doc = new YourModel({});
    const error = doc.validateSync();
    
    expect(error).toBeDefined();
    expect(error?.errors.requiredField).toBeDefined();
  });

  it('should set default values', () => {
    const doc = new YourModel({
      email: 'test@example.com',
      password: 'hashed'
    });
    
    expect(doc.createdAt).toBeDefined();
    expect(doc.role).toBe('user');
  });

  it('should enforce unique constraints', () => {
    const emailField = YourSchema.path('email');
    expect(emailField.options.unique).toBe(true);
  });
});
```

### 3. Testing Routes (Integration Tests)

```typescript
// src/routes/__tests__/your-routes.test.ts
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import YourModel from '../../models/YourModel';
import routes from '../your-routes';

let app: Express;
let mongoServer: MongoMemoryServer;

describe('Your Routes', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    
    app = express();
    app.use(express.json());
    app.use('/api', routes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await YourModel.deleteMany({});
  });

  describe('GET /api/items', () => {
    it('should return all items', async () => {
      await YourModel.create({ name: 'Item 1' });
      await YourModel.create({ name: 'Item 2' });

      const res = await request(app).get('/api/items');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('Item 1');
    });

    it('should return empty array if no items', async () => {
      const res = await request(app).get('/api/items');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/items', () => {
    it('should create new item', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: 'New Item' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Item');

      const item = await YourModel.findById(res.body._id);
      expect(item).toBeDefined();
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('name');
    });
  });
});
```

---

## Frontend Test Examples (Jasmine)

### 1. Testing Services

```typescript
// src/app/services/your.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [YourService]
    });

    service = TestBed.inject(YourService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getItems', () => {
    it('should fetch items from API', () => {
      const mockItems = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      service.getItems().subscribe(items => {
        expect(items).toEqual(mockItems);
        expect(items.length).toBe(2);
      });

      const req = httpMock.expectOne('http://api/items');
      expect(req.request.method).toBe('GET');
      req.flush(mockItems);
    });

    it('should handle errors', () => {
      service.getItems().subscribe(
        () => fail('should have failed'),
        error => {
          expect(error).toBeDefined();
        }
      );

      const req = httpMock.expectOne('http://api/items');
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('createItem', () => {
    it('should POST new item', () => {
      const newItem = { name: 'New Item' };

      service.createItem(newItem).subscribe(item => {
        expect(item.id).toBeDefined();
        expect(item.name).toBe('New Item');
      });

      const req = httpMock.expectOne('http://api/items');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newItem);
      req.flush({ id: 3, ...newItem });
    });
  });
});
```

### 2. Testing Providers/Guards

```typescript
// src/app/services/your.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { YourService } from './your.service';
import { YourGuard } from './your.guard';

describe('YourGuard', () => {
  let guard: YourGuard;
  let serviceSpyObj: jasmine.SpyObj<YourService>;
  let routerSpyObj: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const serviceSpy = jasmine.createSpyObj('YourService', ['checkCondition']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        YourGuard,
        { provide: YourService, useValue: serviceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(YourGuard);
    serviceSpyObj = TestBed.inject(YourService) as jasmine.SpyObj<YourService>;
    routerSpyObj = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow activation when condition is met', () => {
    serviceSpyObj.checkCondition.and.returnValue(true);

    const result = guard.canActivate(null as any, null as any);

    expect(result).toBe(true);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });

  it('should prevent activation and redirect when condition not met', () => {
    serviceSpyObj.checkCondition.and.returnValue(false);

    const result = guard.canActivate(null as any, null as any);

    expect(result).toBe(false);
    expect(routerSpyObj.navigate).toHaveBeenCalledWith(['/error']);
  });
});
```

### 3. Testing Components

```typescript
// src/app/pages/your-page/your-page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YourComponent } from './your.component';
import { YourService } from '../../services/your.service';

describe('YourComponent', () => {
  let component: YourComponent;
  let fixture: ComponentFixture<YourComponent>;
  let service: jasmine.SpyObj<YourService>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('YourService', ['getItems', 'deleteItem']);

    await TestBed.configureTestingModule({
      imports: [YourComponent],
      providers: [{ provide: YourService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(YourComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(YourService) as jasmine.SpyObj<YourService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load items on init', () => {
    const mockItems = [{ id: 1, name: 'Item 1' }];
    service.getItems.and.returnValue(of(mockItems));

    fixture.detectChanges(); // Triggers ngOnInit

    expect(service.getItems).toHaveBeenCalled();
    expect(component.items).toEqual(mockItems);
  });

  it('should delete item when delete button clicked', () => {
    component.items = [{ id: 1, name: 'Item 1' }];
    service.deleteItem.and.returnValue(of(null));

    const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
    deleteButton.nativeElement.click();

    expect(service.deleteItem).toHaveBeenCalledWith(1);
  });

  it('should display items in template', () => {
    component.items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ];
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css('.item'));
    expect(items.length).toBe(2);
    expect(items[0].nativeElement.textContent).toContain('Item 1');
  });

  it('should emit event when item selected', () => {
    spyOn(component.itemSelected, 'emit');

    component.selectItem({ id: 1, name: 'Item 1' });

    expect(component.itemSelected.emit).toHaveBeenCalledWith({ id: 1, name: 'Item 1' });
  });
});
```

---

## E2E Test Examples (Cypress)

### 1. Authentication Flow Tests

```typescript
// cypress/e2e/user-workflows.cy.ts
describe('User Workflows', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete registration to login flow', () => {
    // Register
    cy.visit('/register');
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Should be logged in and redirected
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Welcome');

    // Logout
    cy.get('button.logout').click();
    cy.url().should('include', '/login');
  });

  it('should persist login across page refreshes', () => {
    // Login
    cy.loginViaUI('user@example.com', 'password123');
    cy.url().should('include', '/dashboard');

    // Refresh page
    cy.reload();

    // Should still be logged in
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Dashboard');
  });

  it('should clear login on logout', () => {
    cy.loginViaUI('user@example.com', 'password123');
    cy.get('button.logout').click();

    // Should not be able to access protected pages
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});
```

### 2. Form Validation Tests

```typescript
// cypress/e2e/forms.cy.ts
describe('Form Validation', () => {
  it('should show validation errors', () => {
    cy.visit('/register');

    // Submit without filling form
    cy.get('button[type="submit"]').click();

    // Should show errors
    cy.get('.error, [role="alert"]').should('have.length', 3);
  });

  it('should validate email format', () => {
    cy.visit('/register');
    cy.get('input[name="email"]').type('invalidemail');
    cy.get('button[type="submit"]').click();

    cy.get('.error-email, [data-error="email"]').should('contain', 'valid email');
  });

  it('should validate password strength', () => {
    cy.visit('/register');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('123');
    cy.get('button[type="submit"]').click();

    cy.get('.error-password, [data-error="password"]').should('contain', 'at least 6');
  });

  it('should clear errors on correct input', () => {
    cy.visit('/register');
    cy.get('input[name="email"]').type('invalid');
    cy.get('[role="alert"]').should('exist');

    cy.get('input[name="email"]').clear().type('test@example.com');
    cy.get('[role="alert"]').should('not.exist');
  });
});
```

### 3. User Interaction Tests

```typescript
// cypress/e2e/interactions.cy.ts
describe('User Interactions', () => {
  beforeEach(() => {
    cy.loginViaUI('user@example.com', 'password123');
  });

  it('should toggle sidebar', () => {
    cy.get('.sidebar').should('be.visible');
    cy.get('.toggle-sidebar').click();
    cy.get('.sidebar').should('not.be.visible');
    cy.get('.toggle-sidebar').click();
    cy.get('.sidebar').should('be.visible');
  });

  it('should filter items', () => {
    cy.visit('/items');
    cy.get('.item').should('have.length', 10);

    cy.get('input[placeholder="Search"]').type('test');
    cy.get('.item').should('have.length.lessThan', 10);

    cy.get('input[placeholder="Search"]').clear();
    cy.get('.item').should('have.length', 10);
  });

  it('should handle pagination', () => {
    cy.visit('/items');
    cy.get('.page-info').should('contain', 'Page 1');

    cy.get('[data-test="next-btn"]').click();
    cy.get('.page-info').should('contain', 'Page 2');

    cy.get('[data-test="prev-btn"]').click();
    cy.get('.page-info').should('contain', 'Page 1');
  });
});
```

---

## Tips for Writing Good Tests

### Do's ✅
- Test behavior, not implementation
- Use meaningful test names
- Keep tests focused and small
- Mock external dependencies
- Use before/after hooks for setup/cleanup
- Test error cases too
- Use data-testid attributes for E2E tests

### Don'ts ❌
- Don't test third-party libraries
- Don't create interdependent tests
- Don't test private methods
- Don't use hardcoded delays (use waits/assertions)
- Don't test multiple things in one test
- Don't ignore failing tests

---

## Quick Reference

### Backend Commands
```bash
# Run tests
npm test

# Watch mode
npm test:watch

# Coverage
npm test:coverage

# Specific file
npm test -- auth.middleware.test.ts
```

### Frontend Commands
```bash
# Unit tests
npm test

# Unit tests with coverage
npm test:coverage

# E2E interactive
npm run e2e

# E2E headless
npm run e2e:run
```

---

For more details, see `TESTING.md` in the root directory.
