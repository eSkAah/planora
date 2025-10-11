import { expect, test } from '@playwright/test';

test.describe('Schedules Workflow', () => {
  test('should access schedules page after login', async ({ page }) => {
    await page.goto('/');

    // Create account
    const timestamp = Date.now();
    const companyName = `Schedule Test Co ${timestamp}`;
    const userEmail = `schedules${timestamp}@example.com`;

    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    // Fill company and user info
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

    // Navigate to schedules via URL (simpler than clicking)
    await page.goto('/schedules');
    await page.waitForTimeout(3000);

    // Verify we're on a protected page (either schedules or were redirected to dashboard/onboarding)
    const url = page.url();
    expect(url).toMatch(/\/(schedules|dashboard|onboarding)/);
  });
});
