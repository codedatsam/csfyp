# 🧪 Husleflow Testing Guide

## Author: Samson Fabiyi (22065067)

---

## 📋 Prerequisites

Before running tests, ensure you have:
1. Node.js installed (v18+)
2. npm installed
3. A `.env` file with database credentials

---

## 🚀 Running Tests Locally

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Set Up Environment

Create a `.env` file in the backend folder:

```env
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
```

### Step 3: Run All Tests

```bash
npm test
```

### Step 4: Run Specific Test Files

```bash
# Run only authentication tests
npm run test:auth

# Run only services tests
npm run test:services

# Run only bookings tests
npm run test:bookings
```

### Step 5: Run Tests with Coverage Report

```bash
npm run test:coverage
```

---

## 📊 Test Structure

```
backend/
├── tests/
│   ├── setup.js          # Test configuration
│   ├── auth.test.js      # Authentication tests
│   ├── services.test.js  # Services CRUD tests
│   └── bookings.test.js  # Bookings tests
├── jest.config.js        # Jest configuration
└── package.json          # Test scripts
```

---

## 🔍 Test Categories

### Authentication Tests (auth.test.js)
- ✅ User registration
- ✅ Duplicate email rejection
- ✅ Invalid email/password rejection
- ✅ User login
- ✅ Profile retrieval
- ✅ Profile update
- ✅ Password change

### Services Tests (services.test.js)
- ✅ Get all services (public)
- ✅ Get categories (public)
- ✅ Create service (protected)
- ✅ Update service (protected)
- ✅ Delete service (protected)
- ✅ Get service by ID

### Bookings Tests (bookings.test.js)
- ✅ Create booking
- ✅ Double-booking prevention
- ✅ Get client bookings
- ✅ Get provider bookings
- ✅ Update booking status
- ✅ Cancel booking
- ✅ Get available slots

---

## 📝 Understanding Test Output

```
PASS  tests/auth.test.js
  Authentication Endpoints
    POST /api/v1/auth/register
      ✓ should register a new user successfully (234 ms)
      ✓ should reject duplicate email registration (89 ms)
    POST /api/v1/auth/login
      ✓ should login with valid credentials (156 ms)
      ✓ should reject login with wrong password (78 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Time:        3.456 s
```

---

## ⚠️ Important Notes

1. **Tests use the same database** - Test users are cleaned up after tests
2. **Run tests one at a time** - Use `--runInBand` flag (already configured)
3. **Check `.env` file** - Tests need valid database connection

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check your DATABASE_URL in `.env`
- Ensure Supabase is active

### "Tests hanging"
- Increase timeout in jest.config.js
- Check for unclosed database connections

### "Port already in use"
- Stop any running server instances
- Or change PORT in `.env`

---

## 📈 Code Coverage

After running `npm run test:coverage`, check the `coverage/` folder for:
- HTML report: `coverage/lcov-report/index.html`
- Summary in terminal

Target: 70%+ coverage for main features
