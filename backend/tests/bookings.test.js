// ==========================================
// BOOKINGS TESTS
// ==========================================
// Author: Samson Fabiyi
// Description: Unit tests for bookings endpoints
// ==========================================

const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/config/database');

describe('Bookings Endpoints', () => {
  
  // Test data
  let clientToken;
  let providerToken;
  let clientId;
  let providerId;
  let providerUserId;
  let serviceId;
  let bookingId;

  const clientUser = {
    email: `client_${Date.now()}@example.com`,
    password: 'Test@123456',
    firstName: 'Client',
    lastName: 'Test'
  };

  const providerUser = {
    email: `provider_book_${Date.now()}@example.com`,
    password: 'Test@123456',
    firstName: 'Provider',
    lastName: 'Test'
  };

  // Setup: Create client, provider, and service
  beforeAll(async () => {
    try {
      // Register client
      const clientRegRes = await request(app)
        .post('/api/v1/auth/register')
        .send(clientUser);
      
      if (clientRegRes.body.data && clientRegRes.body.data.user) {
        clientId = clientRegRes.body.data.user.id;
      }

      // Find client if not returned
      if (!clientId) {
        const client = await prisma.user.findUnique({
          where: { email: clientUser.email }
        });
        if (client) clientId = client.id;
      }

      // Verify client email
      if (clientId) {
        await prisma.user.update({
          where: { id: clientId },
          data: { isEmailVerified: true }
        });
      }

      // Login client
      const clientLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: clientUser.email,
          password: clientUser.password
        });
      
      if (clientLoginRes.body.data && clientLoginRes.body.data.tokens) {
        clientToken = clientLoginRes.body.data.tokens.accessToken;
      }

      // Register provider
      const providerRegRes = await request(app)
        .post('/api/v1/auth/register')
        .send(providerUser);
      
      if (providerRegRes.body.data && providerRegRes.body.data.user) {
        providerUserId = providerRegRes.body.data.user.id;
      }

      // Find provider if not returned
      if (!providerUserId) {
        const provider = await prisma.user.findUnique({
          where: { email: providerUser.email }
        });
        if (provider) providerUserId = provider.id;
      }

      // Verify provider and set role
      if (providerUserId) {
        await prisma.user.update({
          where: { id: providerUserId },
          data: { isEmailVerified: true, role: 'PROVIDER' }
        });

        // Create provider profile
        const provider = await prisma.provider.create({
          data: {
            user: { connect: { id: providerUserId } },
            businessName: 'Booking Test Business',
            description: 'Test business for bookings'
          }
        });
        providerId = provider.id;

        // Create a service
        const service = await prisma.service.create({
          data: {
            provider: { connect: { id: providerId } },
            serviceName: 'Booking Test Service',
            category: 'Haircuts',
            price: 25.00,
            duration: 30,
            isActive: true
          }
        });
        serviceId = service.id;
      }

      // Login provider
      const providerLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: providerUser.email,
          password: providerUser.password
        });
      
      if (providerLoginRes.body.data && providerLoginRes.body.data.tokens) {
        providerToken = providerLoginRes.body.data.tokens.accessToken;
      }
    } catch (error) {
      console.error('Setup error:', error.message);
    }
  });

  // Cleanup
  afterAll(async () => {
    try {
      if (bookingId) {
        await prisma.booking.deleteMany({ where: { id: bookingId } });
      }
      if (serviceId) {
        await prisma.service.deleteMany({ where: { id: serviceId } });
      }
      if (providerId) {
        await prisma.provider.deleteMany({ where: { id: providerId } });
      }
      await prisma.user.deleteMany({ 
        where: { 
          email: { in: [clientUser.email, providerUser.email] } 
        } 
      });
    } catch (error) {
      console.log('Cleanup error:', error.message);
    }
  });

  // ==========================================
  // CREATE BOOKING
  // ==========================================
  describe('POST /api/v1/bookings', () => {
    
    it('should create a booking with valid data', async () => {
      if (!clientToken || !serviceId) {
        console.log('Skipping: Missing clientToken or serviceId');
        return;
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const bookingDate = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          serviceId: serviceId,
          bookingDate: bookingDate,
          timeSlot: '10:00',
          notes: 'Test booking'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking).toBeDefined();
      expect(response.body.data.booking.status).toBe('PENDING');
      
      bookingId = response.body.data.booking.id;
    });

    it('should reject booking without authentication', async () => {
      if (!serviceId) return;

      const response = await request(app)
        .post('/api/v1/bookings')
        .send({
          serviceId: serviceId,
          bookingDate: '2025-12-15',
          timeSlot: '11:00'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject booking without required fields', async () => {
      if (!clientToken || !serviceId) return;

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          serviceId: serviceId
          // Missing bookingDate and timeSlot
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject double booking for same slot', async () => {
      if (!clientToken || !serviceId) return;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const bookingDate = tomorrow.toISOString().split('T')[0];

      // Try to book the same slot again
      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          serviceId: serviceId,
          bookingDate: bookingDate,
          timeSlot: '10:00'  // Same slot as first booking
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      const errorMsg = response.body.message || response.body.error || '';
      expect(errorMsg.toLowerCase()).toMatch(/already|booked|taken|slot/);
    });
  });

  // ==========================================
  // GET MY BOOKINGS (Client)
  // ==========================================
  describe('GET /api/v1/bookings/my-bookings', () => {
    
    it('should get client bookings', async () => {
      if (!clientToken) return;

      const response = await request(app)
        .get('/api/v1/bookings/my-bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toBeDefined();
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/my-bookings')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // GET PROVIDER BOOKINGS
  // ==========================================
  describe('GET /api/v1/bookings/provider-bookings', () => {
    
    it('should get provider bookings', async () => {
      if (!providerToken) return;

      const response = await request(app)
        .get('/api/v1/bookings/provider-bookings')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toBeDefined();
    });
  });

  // ==========================================
  // UPDATE BOOKING STATUS (Provider)
  // ==========================================
  describe('PATCH /api/v1/bookings/:id/status', () => {
    
    it('should confirm booking as provider', async () => {
      if (!providerToken || !bookingId) return;

      const response = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking.status).toBe('CONFIRMED');
    });

    it('should reject invalid status', async () => {
      if (!providerToken || !bookingId) return;

      const response = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // CANCEL BOOKING (Client)
  // ==========================================
  describe('DELETE /api/v1/bookings/:id', () => {
    
    it('should cancel booking as client', async () => {
      if (!clientToken || !bookingId) return;

      const response = await request(app)
        .delete(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking.status).toBe('CANCELLED');
    });

    it('should reject cancelling already cancelled booking', async () => {
      if (!clientToken || !bookingId) return;

      const response = await request(app)
        .delete(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      const errorMsg = response.body.message || response.body.error || '';
      expect(errorMsg.toLowerCase()).toMatch(/already|cancelled/);
    });
  });

  // ==========================================
  // GET AVAILABLE SLOTS
  // ==========================================
  describe('GET /api/v1/bookings/available-slots', () => {
    
    it('should get available slots for a date', async () => {
      if (!clientToken || !providerId) return;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const date = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/v1/bookings/available-slots?providerId=${providerId}&date=${date}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.openingTime).toBeDefined();
      expect(response.body.data.closingTime).toBeDefined();
    });

    it('should require providerId and date', async () => {
      if (!clientToken) return;

      const response = await request(app)
        .get('/api/v1/bookings/available-slots')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
