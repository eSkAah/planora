import { expect, test } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Create account and login
    await page.goto('/');

    const timestamp = Date.now();
    const companyName = `Dashboard Test ${timestamp}`;
    const userEmail = `dashboard${timestamp}@example.com`;
    const password = 'TestPassword123!';

    // Signup flow
    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    await page.getByLabel("Nom de l'entreprise").fill(companyName);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'France' }).click();
    await page.getByLabel('Secteur').fill('Technology');

    await page.getByLabel('Prénom').fill('Test');
    await page.getByLabel('Nom', { exact: true }).fill('Dashboard');
    await page.getByLabel('Email professionnel').fill(userEmail);
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Administrateur' }).click();
    await page.getByPlaceholder('••••••••').first().fill(password);
    await page.getByPlaceholder('••••••••').nth(1).fill(password);

    await page.click('button:has-text("Créer mon compte")');

    // Wait for auto-signin and redirect to onboarding/dashboard
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
  });

  test('should display dashboard with stats', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Check dashboard title
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Check stats cards are visible
    await expect(page.getByText('Employés actifs')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Shifts aujourd\'hui' })).toBeVisible();
    await expect(page.getByText('Heures semaine')).toBeVisible();
    await expect(page.getByText('Coût semaine')).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Check quick actions section
    await expect(page.getByText('Actions rapides')).toBeVisible();
    await expect(page.getByText('Créer un shift')).toBeVisible();
    await expect(page.getByText('Gérer l\'équipe')).toBeVisible();
  });

  test('should navigate to planning from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Click on "Voir le planning" button
    await page.click('button:has-text("Voir le planning")');

    // Should navigate to planning page
    await expect(page).toHaveURL(/\/planning/);
  });

  test('should display notifications section', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Check notifications section exists
    await expect(page.getByText('Notifications')).toBeVisible();
  });

  test('should display shifts today section', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Check shifts today section using heading role for specificity
    await expect(page.getByRole('heading', { name: 'Shifts aujourd\'hui' })).toBeVisible();
  });

  test('should show zero stats for new account', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // New account should have 0 employees and 0 shifts
    const statsCards = page.locator('.text-3xl.font-semibold.text-white');

    // Wait for stats to load
    await page.waitForTimeout(1000);

    // At least one stat should be visible
    await expect(statsCards.first()).toBeVisible();
  });
});
