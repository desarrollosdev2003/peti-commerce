import { test, expect } from '@playwright/test';

test.describe('Peti E-Commerce • Flujo Completo E2E', () => {
  test('1. La tienda carga correctamente el catálogo y el perfil de Peti', async ({ page }) => {
    await page.goto('/');

    // Check artist name and subheader
    await expect(page.locator('body')).toContainText('Peti');
    await expect(page.locator('body')).toContainText('Commissions & Store');

    // Check that at least one "Solicitar Comisión" button exists
    const orderBtn = page.locator('button:has-text("Solicitar Comisión")').first();
    await expect(orderBtn).toBeVisible();
  });

  test('2. Apertura del modal de personalización y agregar al carrito', async ({ page }) => {
    await page.goto('/');

    // Click on the first commission
    const orderBtn = page.locator('button:has-text("Solicitar Comisión")').first();
    await orderBtn.click();

    // Verify modal is open with textarea
    const briefInput = page.locator('textarea');
    await expect(briefInput).toBeVisible();
    await briefInput.fill('Quiero una ilustración de mi personaje con fondo de atardecer.');

    // Click "Añadir al Carrito"
    const addToCartBtn = page.locator('button').filter({ hasText: /Añadir al Carrito/i });
    await addToCartBtn.click();

    // Verify cart drawer is opened with total
    await expect(page.locator('text=Carrito de Comisiones')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Proceder al Pago")')).toBeVisible();
  });

  test('3. Realizar compra de prueba (Sandbox) y abrir Sala de Seguimiento', async ({ page }) => {
    await page.goto('/');

    // 1. Add item to cart
    const orderBtn = page.locator('button:has-text("Solicitar Comisión")').first();
    await orderBtn.click();
    await page.locator('textarea').fill('Comisión de prueba automatizada E2E.');
    await page.locator('button').filter({ hasText: /Añadir al Carrito/i }).click();

    // 2. Open Checkout
    const checkoutBtn = page.locator('button:has-text("Proceder al Pago")');
    await checkoutBtn.click();

    // 3. Verify Checkout Modal
    await expect(page.locator('text=Confirmar Encargo & Pago')).toBeVisible();

    // Fill customer info
    await page.locator('input[type="email"]').fill('comprador.test@gmail.com');
    await page.locator('input[placeholder*="alias"]').fill('Comprador Playwright');

    // Select Test Sandbox mode
    const testModeOption = page.locator('text=Modo Test / Compra de Prueba');
    await testModeOption.click();

    // Submit order
    const submitBtn = page.locator('button:has-text("Confirmar Pedido de Prueba")');
    await submitBtn.click();

    // 4. Verify redirected to tracking room
    await expect(page).toHaveURL(/\/track\/PETI-\d+/, { timeout: 10000 });
    await expect(page.locator('text=Chat directo con Peti')).toBeVisible();
    await expect(page.locator('text=En vivo')).toBeVisible();
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
