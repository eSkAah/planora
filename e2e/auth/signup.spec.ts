import { test } from '@playwright/test';

test.describe('Account Creation', () => {
  test('should create account and complete basic workflow', async ({ page }) => {
    await page.goto('/');

    // Create account
    const timestamp = Date.now();
    const companyName = `Test Company ${timestamp}`;
    const userEmail = `test${timestamp}@example.com`;

    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    await page.getByLabel("Nom de l'entreprise").fill(companyName);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'France' }).click();
    await page.getByLabel('Secteur').fill('Technology');
    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Email professionnel').fill(userEmail);
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Administrateur' }).click();
    await page.getByPlaceholder('••••••••').first().fill('TestPassword123!');
    await page.getByPlaceholder('••••••••').nth(1).fill('TestPassword123!');

    await page.click('button:has-text("Créer mon compte")');

    // Wait for auto-signin and redirect to onboarding/dashboard
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
  });
});
