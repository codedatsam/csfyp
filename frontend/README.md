# 🧪 Husleflow E2E Testing with Cypress

## Author: Samson Fabiyi (22065067)

---

## 📋 What is Cypress?

Cypress is an end-to-end testing framework that runs tests in a real browser. It simulates real user interactions like clicking buttons, filling forms, and navigating between pages.

---

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Start Your App (Terminal 1)

```bash
# Make sure backend is running
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

### Step 3: Run Cypress

**Option A: Interactive Mode (Recommended for development)**
```bash
npm run cypress:open
```
This opens the Cypress Test Runner UI where you can:
- See tests running in a real browser
- Debug failing tests
- Take screenshots

**Option B: Headless Mode (For CI/CD)**
```bash
npm run cypress:run
```
Runs all tests in the terminal without a browser UI.

**Option C: Headed Mode (See browser but automated)**
```bash
npm run test:e2e:headed
```

---

## 📁 Test Structure

```
frontend/
├── cypress/
│   ├── e2e/                    # Test files
│   │   ├── auth.cy.js          # Login, Register, Logout tests
│   │   ├── services.cy.js      # Browse and view services
│   │   ├── booking.cy.js       # Booking flow tests
│   │   └── navigation.cy.js    # Navigation and accessibility
│   ├── support/
│   │   ├── commands.js         # Custom reusable commands
│   │   └── e2e.js              # Global setup
│   └── fixtures/
│       └── testData.json       # Test data
├── cypress.config.js           # Cypress configuration
└── package.json                # Scripts
```

---

## 🧪 Test Categories

### Authentication Tests (auth.cy.js)
- ✅ Display registration page
- ✅ Register new user
- ✅ Show validation errors
- ✅ Display login page
- ✅ Show login error for invalid credentials
- ✅ Navigation between auth pages

### Services Tests (services.cy.js)
- ✅ Display services page
- ✅ Show service cards
- ✅ Filter by category
- ✅ Search functionality
- ✅ Navigate to service detail

### Booking Tests (booking.cy.js)
- ✅ Show login prompt for unauthenticated users
- ✅ Display date picker
- ✅ Display time picker
- ✅ Show price summary

### Navigation Tests (navigation.cy.js)
- ✅ Load home page
- ✅ Display navbar
- ✅ Navigate to services
- ✅ Navigate to login
- ✅ Responsive design (mobile/tablet)
- ✅ Protected routes redirect to login

---

## 📝 Writing New Tests

### Basic Test Structure:
```javascript
describe('Feature Name', () => {
  
  beforeEach(() => {
    // Runs before each test
    cy.visit('/');
  });

  it('should do something', () => {
    // Your test code
    cy.get('button').click();
    cy.contains('Success').should('be.visible');
  });
});
```

### Common Commands:
```javascript
cy.visit('/login')                    // Go to page
cy.get('input[type="email"]')         // Select element
cy.contains('Submit')                  // Find by text
cy.click()                             // Click element
cy.type('hello')                       // Type text
cy.should('be.visible')                // Assert visibility
cy.url().should('include', '/dashboard') // Check URL
```

### Using Custom Commands:
```javascript
// Login quickly via API
cy.loginViaApi('test@example.com', 'password');

// Check toast message
cy.checkToast('Success!');
```

---

## 🎯 Running Specific Tests

```bash
# Run only auth tests
npx cypress run --spec "cypress/e2e/auth.cy.js"

# Run only services tests
npx cypress run --spec "cypress/e2e/services.cy.js"

# Run multiple specific tests
npx cypress run --spec "cypress/e2e/auth.cy.js,cypress/e2e/navigation.cy.js"
```

---

## 📊 Expected Output

```
  Authentication
    Registration
      ✓ should display the registration page (1234ms)
      ✓ should register a new user successfully (2345ms)
      ✓ should show error for invalid email (567ms)
    Login
      ✓ should display the login page (456ms)
      ✓ should show error for invalid credentials (1234ms)

  Services
    Browse Services
      ✓ should display the services page (789ms)
      ✓ should display service cards (1234ms)

  All specs passed!    20 passing (45s)
```

---

## ⚠️ Troubleshooting

### "Cannot find module 'cypress'"
```bash
npm install cypress --save-dev
```

### "Cypress cannot connect to localhost:5173"
Make sure your frontend is running:
```bash
npm run dev
```

### Tests failing randomly
Add more waiting time:
```javascript
cy.get('element', { timeout: 10000 }).should('be.visible');
```

---

## 🎬 For Your Supervisor Demo

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open Cypress: `npm run cypress:open`
4. Click on a test file to run it
5. Watch the browser execute your tests in real-time!

This is very impressive for demos as your supervisor can see the app being tested automatically! 🎉
