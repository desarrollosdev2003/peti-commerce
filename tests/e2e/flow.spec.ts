import { test, expect } from '@playwright/test';

test.describe('Peti E-Commerce • Flujo Completo E2E', () => {
  test('1. La tienda carga correctamente el catálogo, el perfil de Peti y el selector de idioma', async ({ page }) => {
    await page.goto('/');

    // Check artist name and bio
    await expect(page.locator('body')).toContainText('Peti');

    // Check Preferences dropdown button exists
    const prefDropdown = page.locator('[data-testid="language-toggle"]');
    await expect(prefDropdown).toBeVisible();

    // Verify initial load is in Spanish
    await expect(page.locator('body')).toContainText(/Comisiones|Solicitar Comisión/i);

    // Open dropdown and switch to English
    await prefDropdown.click();
    await page.locator('[data-testid="lang-option-en"]').click();
    await expect(page.locator('body')).toContainText(/Commissions|Order Commission/i);

    // Open dropdown and switch back to Spanish
    await prefDropdown.click();
    await page.locator('[data-testid="lang-option-es"]').click();
    await expect(page.locator('body')).toContainText(/Comisiones|Solicitar Comisión/i);
  });

  test('2. Apertura del modal de personalización y agregar al carrito', async ({ page }) => {
    await page.goto('/');

    // Click on the first commission
    const orderBtn = page.locator('button').filter({ hasText: /(Solicitar Comisión|Order Commission)/i }).first();
    await orderBtn.click();

    // Verify modal is open with textarea
    const briefInput = page.locator('textarea');
    await expect(briefInput).toBeVisible();
    await briefInput.fill('Quiero una ilustración de mi personaje con fondo de atardecer.');

    // Click "Añadir al Carrito"
    const addToCartBtn = page.locator('button').filter({ hasText: /(Añadir al Carrito|Add to Cart)/i });
    await addToCartBtn.click();

    // Verify cart drawer is opened with total
    await expect(page.locator('body')).toContainText(/Carrito|Cart/i);
    const checkoutBtn = page.locator('button').filter({ hasText: /(Proceder al Pago|Proceed to Checkout)/i });
    await expect(checkoutBtn).toBeVisible();
  });

  test('3. Realizar compra de prueba (Sandbox) y abrir Sala de Seguimiento', async ({ page }) => {
    await page.goto('/');

    // 1. Add item to cart
    const orderBtn = page.locator('button').filter({ hasText: /(Solicitar Comisión|Order Commission)/i }).first();
    await orderBtn.click();
    await page.locator('textarea').fill('Comisión de prueba automatizada E2E.');
    await page.locator('button').filter({ hasText: /(Añadir al Carrito|Add to Cart)/i }).click();

    // 2. Open Checkout
    const checkoutBtn = page.locator('button').filter({ hasText: /(Proceder al Pago|Proceed to Checkout)/i });
    await checkoutBtn.click();

    // 3. Verify Checkout Modal
    await expect(page.locator('body')).toContainText(/(Confirmar Encargo|Confirm Order)/i);

    // Fill customer info
    await page.locator('input[type="email"]').fill('comprador.test@gmail.com');
    await page.locator('input[placeholder*="alias"], input[placeholder*="name"], input[placeholder*="nombre"], input[placeholder*="Your name"]').first().fill('Comprador Playwright');

    // Select Test Sandbox mode
    const testModeOption = page.locator('[data-testid="payment-method-test"]');
    await testModeOption.click();

    // Submit order
    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /(Confirmar|Pagar|Pay)/i });
    await submitBtn.click();

    // 4. Verify redirected to tracking room
    await expect(page).toHaveURL(/\/track\/PETI-\d+/, { timeout: 15000 });
    await expect(page.locator('body')).toContainText(/Chat/i);
    await expect(page.locator('body')).toContainText(/(En vivo|Live)/i);
  });

  test('4. El panel de Administrador (/admin) está protegido por Login con Email y Contraseña', async ({ page }) => {
    await page.goto('/admin');

    // Verify admin login form is displayed
    await expect(page.locator('text=Acceso Exclusivo de Artista')).toBeVisible();
    await expect(page.locator('text=Panel de Administración')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Iniciar Sesión como Administrador")')).toBeVisible();
  });
});
