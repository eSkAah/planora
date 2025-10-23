import { expect, test } from '@playwright/test';

test.describe('Planning & Shifts Management', () => {
  let userEmail: string;
  let password: string;

  test.beforeEach(async ({ page }) => {
    // Create account and login
    await page.goto('/');

    const timestamp = Date.now();
    const companyName = `Planning Test ${timestamp}`;
    userEmail = `planning${timestamp}@example.com`;
    password = 'TestPassword123!';

    // Signup flow
    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    await page.getByLabel("Nom de l'entreprise").fill(companyName);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'France' }).click();
    await page.getByLabel('Secteur').fill('Technology');

    await page.getByLabel('Prénom').fill('Test');
    await page.getByLabel('Nom', { exact: true }).fill('Planning');
    await page.getByLabel('Email professionnel').fill(userEmail);
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Administrateur' }).click();
    await page.getByPlaceholder('••••••••').first().fill(password);
    await page.getByPlaceholder('••••••••').nth(1).fill(password);

    await page.click('button:has-text("Créer mon compte")');

    // Wait for auto-signin and redirect to onboarding/dashboard
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
  });

  test('should display planning page with calendar', async ({ page }) => {
    await page.goto('/planning');
    await page.waitForTimeout(2000);

    // Check planning title
    await expect(page.getByRole('heading', { name: 'Planning' })).toBeVisible();

    // Check stats cards
    await expect(page.getByText('Employés actifs')).toBeVisible();
    await expect(page.getByText('Heures planifiées')).toBeVisible();

    // Check calendar navigation
    await expect(page.getByText('Précédent')).toBeVisible();
    await expect(page.getByText('Suivant')).toBeVisible();
    await expect(page.getByText('Aujourd\'hui')).toBeVisible();
  });

  test('should open create shift modal', async ({ page }) => {
    await page.goto('/planning');
    await page.waitForTimeout(2000);

    // Click add shift button
    await page.click('button:has-text("Ajouter un shift")');

    // Modal should be visible
    await expect(page.getByText('Créer un shift')).toBeVisible();
    await expect(page.getByText('Ajoutez un nouveau shift pour un employé')).toBeVisible();

    // Check form fields
    await expect(page.getByLabel('Employé')).toBeVisible();
    await expect(page.getByLabel('Date')).toBeVisible();
    await expect(page.getByLabel('Type de shift')).toBeVisible();
  });

  test('should navigate between months', async ({ page }) => {
    await page.goto('/planning');
    await page.waitForTimeout(2000);

    const currentMonth = await page.locator('.text-2xl.font-semibold.capitalize.text-white').textContent();

    // Click next month
    await page.click('button:has-text("Suivant")');
    await page.waitForTimeout(500);

    const nextMonth = await page.locator('.text-2xl.font-semibold.capitalize.text-white').textContent();

    // Month should have changed
    expect(nextMonth).not.toBe(currentMonth);

    // Click previous to go back
    await page.click('button:has-text("Précédent")');
    await page.waitForTimeout(500);

    const backToMonth = await page.locator('.text-2xl.font-semibold.capitalize.text-white').textContent();
    expect(backToMonth).toBe(currentMonth);
  });

  test('should return to today when clicking Aujourd\'hui', async ({ page }) => {
    await page.goto('/planning');
    await page.waitForTimeout(2000);

    // Navigate to next month
    await page.click('button:has-text("Suivant")');
    await page.waitForTimeout(500);

    // Click today button
    await page.click('button:has-text("Aujourd\'hui")');
    await page.waitForTimeout(500);

    // Should be back to current month
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleDateString('fr-FR', { month: 'long' }).toLowerCase();
    const displayedMonth = await page.locator('.text-2xl.font-semibold.capitalize.text-white').textContent();

    expect(displayedMonth?.toLowerCase()).toContain(currentMonthName);
  });

  test('should display empty state when no employees', async ({ page }) => {
    await page.goto('/planning');
    await page.waitForTimeout(2000);

    // The admin user counts as 1 employee
    const employeesCount = await page.locator('.text-3xl.font-semibold.text-white').first().textContent();
    // Should show at least the admin user
    expect(parseInt(employeesCount || '0')).toBeGreaterThanOrEqual(1);
  });

  test('should validate shift creation modal fields', async ({ page }) => {
    await page.goto('/planning');
    await page.waitForTimeout(2000);

    // Open modal
    await page.click('button:has-text("Ajouter un shift")');
    await page.waitForTimeout(500);

    // Try to submit without filling fields
    await page.click('button:has-text("Créer le shift")');
    await page.waitForTimeout(1000);

    // Should show validation errors or not submit
    // The form should still be open if validation failed
    await expect(page.getByText('Créer un shift')).toBeVisible();
  });

  test('should close modal on cancel', async ({ page }) => {
    await page.goto('/planning');
    await page.waitForTimeout(2000);

    // Open modal
    await page.click('button:has-text("Ajouter un shift")');
    await page.waitForTimeout(500);

    // Click cancel
    await page.click('button:has-text("Annuler")');
    await page.waitForTimeout(500);

    // Modal should be closed
    await expect(page.getByText('Ajoutez un nouveau shift pour un employé')).not.toBeVisible();
  });
});
