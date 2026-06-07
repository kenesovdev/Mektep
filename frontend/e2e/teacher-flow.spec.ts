import { test, expect, type Page } from '@playwright/test';

const TEACHER = { email: 'teacher@test.kz', password: 'testpass123' };
const MANAGER = { email: 'manager@test.kz', password: 'testpass123' };

async function loginAs(page: Page, creds: { email: string; password: string }): Promise<void> {
  await page.goto('/login');
  await page.fill('[name=email]', creds.email);
  await page.fill('[name=password]', creds.password);
  await page.click('button[type=submit]');
  await page.waitForURL(/\/(teacher|manager|admin)/);
}

test.describe('Critical Path: Teacher', () => {
  test('login as teacher', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', TEACHER.email);
    await page.fill('[name=password]', TEACHER.password);
    await page.click('button[type=submit]');
    await expect(page).toHaveURL(/\/teacher\/dashboard/);
  });

  test('fill and save profile', async ({ page }) => {
    await loginAs(page, TEACHER);
    await page.goto('/teacher/profile');
    await page.fill('[name=first_name]', 'Айгүл');
    await page.fill('[name=last_name]', 'Сейткалиева');
    await page.locator('#experience_years').fill('12');
    await page.getByTestId('profile-save').click();
    await expect(page.getByText(/сохран|сақтал/i)).toBeVisible();
  });
});

test.describe('Critical Path: Manager', () => {
  test('login as manager', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', MANAGER.email);
    await page.fill('[name=password]', MANAGER.password);
    await page.click('button[type=submit]');
    await expect(page).toHaveURL(/\/manager\/dashboard/);
  });

  test('view teacher list', async ({ page }) => {
    await loginAs(page, MANAGER);
    await page.goto('/manager/dashboard');
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('open teacher profile view', async ({ page }) => {
    await loginAs(page, MANAGER);
    await page.goto('/manager/dashboard');
    const viewLink = page.locator('table tbody tr').first().getByRole('link', { name: /просмотр|қарау/i });
    if (await viewLink.count()) {
      await viewLink.click();
      await expect(page).toHaveURL(/\/manager\/teachers\/\d+/);
    }
  });
});

test.describe('Security: no public registration', () => {
  test('registration routes are not available', async ({ request }) => {
    for (const path of ['/api/auth/register/', '/api/register/', '/api/signup/']) {
      const response = await request.post(path, {
        data: { email: 'x@x.kz', password: 'pass12345' },
      });
      expect(response.status()).not.toBe(200);
      expect(response.status()).not.toBe(201);
    }
  });
});
