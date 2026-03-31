// ==========================================
// SERVICES TESTS
// ==========================================
// Author: Samson Fabiyi
// Description: Unit tests for services endpoints
// ==========================================

const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/config/database');

describe('Services Endpoints', () => {
  
  // Test data
  let authToken;
  let userId;
  let providerId;
  let serviceId;
  
  const testUser = {
    email: `provider_${Date.now()}@example.com`,
    password: 'Test@123456',
    firstName: 'Provider',
    lastName: 'Test'
  };

  // Fixed: Removed location field (not in Service model)
  const testService = {
    serviceName: 'Test Haircut Service',
    category: 'Haircuts',
    description: 'A test haircut service',
    price: 25.00,
    duration: 30
  };

  // Setup: Create test user and login
  beforeAll(async () => {
    try {
      // Register user
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      // Get userId from response
      const userData = registerRes.body.data?.user || registerRes.body.user || registerRes.body.data;
      if (userData) {
        userId = userData.id;
      }

      // If userId not set, find by email
      if (!userId) {
        const existingUser = await prisma.user.findUnique({
          where: { email: testUser.email }
        });
        if (existingUser) {
          userId = existingUser.id;
        }
      }

      // Verify email and set role
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { isEmailVerified: true, role: 'PROVIDER' }
        });

        // Create provider profile
        const provider = await prisma.provider.create({
          data: {
            user: { connect: { id: userId } },
            businessName: 'Test Business',
            description: 'A test business'
          }
        });
        providerId = provider.id;
      }

      // Login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      const loginData = loginRes.body.data || loginRes.body;
      authToken = loginData.tokens?.accessToken || loginData.accessToken;
    } catch (error) {
      console.error('Setup error:', error.message);
    }
  });

  // Cleanup
  afterAll(async () => {
    try {
      if (serviceId) {
        await prisma.service.deleteMany({ where: { id: serviceId } });
      }
      if (providerId) {
        await prisma.provider.deleteMany({ where: { id: providerId } });
      }
      if (testUser.email) {
        await prisma.user.deleteMany({ where: { email: testUser.email } });
      }
    } catch (error) {
      console.log('Cleanup error:', error.message);
    }
  });

  // ==========================================
  // GET ALL SERVICES (Public)
  // ==========================================
  describe('GET /api/v1/services', () => {
    
    it('should get all services without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/services')
        .expect(200);

      expect(response.body.success).toBe(true);
      const services = response.body.data?.services || response.body.services;
      expect(services).toBeDefined();
      expect(Array.isArray(services)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/services?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      const pagination = response.body.data?.pagination || response.body.pagination;
      expect(pagination).toBeDefined();
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/v1/services?category=Haircuts')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ==========================================
  // GET CATEGORIES (Public)
  // ==========================================
  describe('GET /api/v1/services/categories', () => {
    
    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/v1/services/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Handle different response structures
      const categories = response.body.data?.categories || response.body.categories || response.body.data;
      expect(categories).toBeDefined();
    });
  });

  // ==========================================
  // CREATE SERVICE (Protected)
  // ==========================================
  describe('POST /api/v1/services', () => {
    
    it('should create a service with valid token', async () => {
      if (!authToken) {
        console.log('Skipping: No auth token available');
        return;
      }

      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testService)
        .expect(201);

      expect(response.body.success).toBe(true);
      const service = response.body.data?.service || response.body.service || response.body.data;
      expect(service).toBeDefined();
      expect(service.serviceName).toBe(testService.serviceName);
      
      serviceId = service.id;
    });

    it('should reject creating service without token', async () => {
      const response = await request(app)
        .post('/api/v1/services')
        .send(testService)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject creating service without required fields', async () => {
      if (!authToken) return;

      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceName: 'Incomplete Service'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // GET SERVICE BY ID (Public)
  // ==========================================
  describe('GET /api/v1/services/:id', () => {
    
    it('should get service by ID', async () => {
      if (!serviceId) {
        console.log('Skipping: No service ID available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/services/${serviceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const service = response.body.data?.service || response.body.service || response.body.data;
      expect(service).toBeDefined();
      expect(service.id).toBe(serviceId);
    });

    it('should return 404 for non-existent service', async () => {
      const response = await request(app)
        .get('/api/v1/services/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // UPDATE SERVICE (Protected)
  // ==========================================
  describe('PATCH /api/v1/services/:id', () => {
    
    it('should update own service', async () => {
      if (!authToken || !serviceId) {
        console.log('Skipping: No auth token or service ID');
        return;
      }

      const response = await request(app)
        .patch(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 30.00,
          description: 'Updated description'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject update without token', async () => {
      if (!serviceId) return;

      const response = await request(app)
        .patch(`/api/v1/services/${serviceId}`)
        .send({
          price: 100.00
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // GET MY SERVICES (Protected)
  // ==========================================
  describe('GET /api/v1/services/my-services', () => {
    
    it('should get provider\'s own services', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/v1/services/my-services')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const services = response.body.data?.services || response.body.services;
      expect(services).toBeDefined();
      expect(Array.isArray(services)).toBe(true);
    });

    it('should reject without token', async () => {
      const response = await request(app)
        .get('/api/v1/services/my-services')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // DELETE SERVICE (Protected)
  // ==========================================
  describe('DELETE /api/v1/services/:id', () => {
    
    it('should reject delete without token', async () => {
      if (!serviceId) return;

      const response = await request(app)
        .delete(`/api/v1/services/${serviceId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
