import request from 'supertest';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../models/User';
import authRoutes from '../../routes/auth.routes';

let app: Express;
let mongoServer: MongoMemoryServer;

describe('Auth Routes Integration Tests', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clear database after each test
    await User.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        email: 'newuser@example.com',
        role: 'user'
      });
      expect(res.body.user.profile.firstName).toBe('John');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('password');
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalidemail',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('invalid email format');
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('at least 6 characters');
    });

    it('should return 409 if email already exists', async () => {
      // First registration
      await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123'
        });

      // Second registration with same email
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already registered');
    });

    it('should normalize email to lowercase', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'TestUser@EXAMPLE.COM',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('testuser@example.com');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user before login tests
      await request(app)
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email');
    });

    it('should return 401 if user not found', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('invalid');
    });

    it('should return 401 if password is incorrect', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('invalid');
    });
  });
});
