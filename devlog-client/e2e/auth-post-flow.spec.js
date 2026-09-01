import { test, expect } from '@playwright/test';

test('usuario completa registro, publicación, logout y login usando API v1', async ({ page }) => {
  const apiPaths = [];
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.startsWith('/api/')) apiPaths.push(pathname);
  });

  const suffix = Date.now();
  const username = `e2e${suffix}`;
  const email = `e2e-${suffix}@example.com`;
  const password = 'E2e-password-123';
  const postContent = `Publicación E2E ${suffix}`;

  await page.goto('/register');
  await page.getByLabel('Usuario').fill(username);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Registrarse' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: `Hola, ${username}` })).toBeVisible();

  await page.getByRole('link', { name: 'Nueva publicación' }).click();
  await page.getByLabel('¿Qué quieres compartir?').fill(postContent);
  await page.getByRole('button', { name: 'Publicar' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(postContent)).toBeVisible();

  const mobileMenuButton = page.getByRole('button', { name: 'Abrir menú de usuario' });
  if (await mobileMenuButton.isVisible()) {
    await mobileMenuButton.click();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  } else {
    await page.getByRole('button', { name: 'Salir' }).click();
  }
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(postContent)).toBeVisible();
  expect(apiPaths.length).toBeGreaterThan(5);
  expect(apiPaths).toContain('/api/v1/auth/register');
  expect(apiPaths).toContain('/api/v1/posts');
  expect(apiPaths).toContain('/api/v1/auth/login');
  expect(apiPaths.every((path) => path.startsWith('/api/v1/'))).toBe(true);
});
