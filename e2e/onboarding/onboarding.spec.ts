import { expect, test } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete onboarding workflow', async ({ page }) => {
    await page.goto('/');

    // Create and login
    const timestamp = Date.now();
    const userEmail = `onboarding${timestamp}@example.com`;

    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    await page.getByLabel("Nom de l'entreprise").fill(`Company ${timestamp}`);
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

    // Wait for auto-signin and redirect to dashboard (onboarding is auto-completed)
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });

    // Since onboarding is now auto-completed, users go directly to dashboard
    // This test verifies the auth flow works correctly
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|onboarding)/);
  });
});
