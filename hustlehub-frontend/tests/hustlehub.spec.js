import { test, expect } from '@playwright/test';

test.describe('HustleHub+ Frontend UI & Interaction Tests', () => {

  test('Component Rendering & Interaction: User Login Flow', async ({ page }) => {
    await page.route('**/login', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' }, // Inject CORS
          json: {
            success: true,
            token: 'mock-jwt-token',
            user: { _id: '123', name: 'Sam S.', role: 'Freelancer', email: 'test@myemeris.edu.za' }
          }
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('http://localhost:5173/login');
    await expect(page.getByRole('heading', { name: /Login to HustleHub\+/i })).toBeVisible();
    
    await page.fill('input[type="email"]', 'test@myemeris.edu.za');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Login")');

    await expect(page).not.toHaveURL(/.*\/login/);
  });


 test('Component Behaviour: Gig Unpublish Toggle', async ({ page }) => {
    // 1. Mock Login API to allow natural UI login
    await page.route('**/login', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          json: {
            success: true,
            token: 'mock-jwt-token',
            user: { _id: '123', name: 'Sam S.', role: 'Freelancer', email: 'test@myemeris.edu.za' }
          }
        });
      } else {
        await route.continue();
      }
    });

    // 2. Mock Gigs API with CORS headers
    await page.route(/\/api\/gigs/, async route => {
      const method = route.request().method();
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      };

      if (method === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: corsHeaders });
      } else if (method === 'GET') {
        await route.fulfill({
          status: 200,
          headers: corsHeaders,
          json: {
            success: true,
            gigs: [{
              _id: 'gig_mock_1',
              title: 'Full Stack Web Development',
              description: 'I will build a React and Node application.',
              category: 'Development',
              price: 2500,
              deliveryDays: 7,
              status: 'published',
              owner: { _id: '123', name: 'Sam S.' }
            }]
          }
        });
      } else if (method === 'DELETE') {
        await route.fulfill({
          status: 200,
          headers: corsHeaders,
          json: { success: true, message: 'Gig successfully unpublished' }
        });
      } else {
        await route.continue();
      }
    });

    // 3. Perform natural UI login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'test@myemeris.edu.za');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Login")');
    await page.getByRole('link', { name: 'Manage Gigs' }).click();

    // 4. Validate rendering of the mocked gig data
    await expect(page.getByText('Full Stack Web Development').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/2500/).first()).toBeVisible();

    // 5. Validate User Interaction: Clicking the Unpublish button
    page.on('dialog', dialog => dialog.accept());
    const unpublishBtn = page.getByRole('button', { name: /Unpublish|Delete/i }).first();
    await expect(unpublishBtn).toBeVisible();
    await unpublishBtn.click();
  });

});