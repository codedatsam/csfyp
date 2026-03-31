// ==========================================
// AUTHENTICATION TESTS
// ==========================================
// Author: Samson Fabiyi
// Description: Unit tests for auth endpoints
// ==========================================

const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/config/database');

describe('Authentication Endpoints', () => {
  
  // Test user data
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Test@123456',
    firstName: 'Test',
    lastName: 'User',
    phone: '07123456789'
  };
  
  let authToken;
  let userId;

  // Clean up test user after all tests
  afterAll(async () => {
    try {
      if (testUser.email) {
        await prisma.user.deleteMany({
          where: { email: testUser.email }
        });
      }
    } catch (error) {
      console.log('Cleanup error:', error.message);
    }
  });

  // ==========================================
  // REGISTER TESTS
  // ==========================================
  describe('POST /api/v1/auth/register', () => {
    
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      // Check for verify or email in message
      expect(response.body.message.toLowerCase()).toMatch(/verify|email|registration/);
      
      // Handle different response structures
      const user = response.body.data?.user || response.body.user || response.body.data;
      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
      expect(user.firstName).toBe(testUser.firstName);
      
      // Password should NOT be in response
      expect(user.password).toBeUndefined();
      
      userId = user.id;
    });

    it('should reject duplicate email registration', async () => {
      // First, verify the email so it's a "real" registered user
      await prisma.user.update({
        where: { email: testUser.email },
        data: { isEmailVerified: true }
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      const errorMsg = response.body.message || response.body.error || '';
      expect(errorMsg.toLowerCase()).toMatch(/already|exists|registered|duplicate/);
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          email: 'another@example.com',
          password: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'incomplete@example.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // LOGIN TESTS
  // ==========================================
  describe('POST /api/v1/auth/login', () => {
    
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Handle different response structures
      const data = response.body.data || response.body;
      expect(data.user || data.tokens).toBeDefined();
      
      authToken = data.tokens?.accessToken || data.accessToken;
      expect(authToken).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      const errorMsg = response.body.message || response.body.error || '';
      expect(errorMsg.toLowerCase()).toMatch(/invalid|wrong|incorrect|credentials/);
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@123456'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject login without email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'Test@123456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // PROFILE TESTS
  // ==========================================
  describe('GET /api/v1/auth/profile', () => {
    
    it('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const user = response.body.data?.user || response.body.user || response.body.data;
      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
    });

    it('should reject profile request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject profile request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // UPDATE PROFILE TESTS
  // ==========================================
  describe('PATCH /api/v1/auth/profile', () => {
    
    it('should update profile successfully', async () => {
      const response = await request(app)
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phone: '07987654321'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const user = response.body.data?.user || response.body.user || response.body.data;
      expect(user.firstName).toBe('Updated');
      expect(user.lastName).toBe('Name');
    });

    it('should reject update without token', async () => {
      const response = await request(app)
        .patch('/api/v1/auth/profile')
        .send({
          firstName: 'Hacker'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // CHANGE PASSWORD TESTS
  // ==========================================
  describe('POST /api/v1/auth/change-password', () => {
    
    it('should change password with correct current password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewTest@123456'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      testUser.password = 'NewTest@123456';
    });

    it('should reject change with wrong current password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'AnotherNew@123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      const errorMsg = response.body.message || response.body.error || '';
      expect(errorMsg.toLowerCase()).toMatch(/incorrect|wrong|invalid|current/);
    });
  });
});
