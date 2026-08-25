import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test.setTimeout(60000);

test.describe('Mobile Viewport Audit', () => {
  test('Capture all key screens on mobile', async ({ page }) => {
    // 1. Home storefront
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'C:/Users/franc/.gemini/antigravity/brain/7c056989-af57-47cf-a1b0-3a608623432c/mobile-home.png', fullPage: true });

    // 2. Preferences dropdown open on mobile
    const prefDropdown = page.locator('[data-testid="language-toggle"]');
    await prefDropdown.click();
    await page.screenshot({ path: 'C:/Users/franc/.gemini/antigravity/brain/7c056989-af57-47cf-a1b0-3a608623432c/mobile-preferences.png' });
    await page.mouse.click(10, 10); // close

    // 3. Commission Customization Modal
    const orderBtn = page.locator('button').filter({ hasText: /(Solicitar Comisión|Order Commission)/i }).first();
    await orderBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'C:/Users/franc/.gemini/antigravity/brain/7c056989-af57-47cf-a1b0-3a608623432c/mobile-commission-modal.png' });

    // Fill brief and add to cart
    const briefInput = page.locator('textarea');
    await briefInput.fill('Boceto de mi avatar en pose de victoria.');
    const addToCartBtn = page.locator('button').filter({ hasText: /(Añadir al Carrito|Add to Cart)/i });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);

    // 4. Cart Sheet (opens automatically)
    await page.screenshot({ path: 'C:/Users/franc/.gemini/antigravity/brain/7c056989-af57-47cf-a1b0-3a608623432c/mobile-cart.png' });

    // 5. Checkout Modal
    const checkoutBtn = page.locator('button').filter({ hasText: /(Proceder al Pago|Proceed to Payment)/i });
    await checkoutBtn.click({ force: true });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:/Users/franc/.gemini/antigravity/brain/7c056989-af57-47cf-a1b0-3a608623432c/mobile-checkout.png' });

    // Fill checkout form and complete sandbox test order
    await page.fill('input[type="email"]', 'lucas.movil@test.com');
    await page.fill('input[placeholder*="nombre" i], input[placeholder*="name" i]', 'Lucas Móvil');
    await page.click('[data-testid="payment-method-test"]');
    const payBtn = page.locator('button[type="submit"]');
    await payBtn.click({ force: true });

    // 6. Tracking Room
    await page.waitForURL(/\/track\/.+/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/franc/.gemini/antigravity/brain/7c056989-af57-47cf-a1b0-3a608623432c/mobile-track-room.png', fullPage: true });

    // 7. Track search page
    await page.goto('/track');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'C:/Users/franc/.gemini/antigravity/brain/7c056989-af57-47cf-a1b0-3a608623432c/mobile-track-search.png', fullPage: true });

    // 8. Account portal
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'C:/Users/franc/.gemini/antigravity/brain/7c056989-af57-47cf-a1b0-3a608623432c/mobile-account.png', fullPage: true });

    // 9. Admin panel
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'C:/Users/franc/.gemini/antigravity/brain/7c056989-af57-47cf-a1b0-3a608623432c/mobile-admin.png', fullPage: true });
  });
});
