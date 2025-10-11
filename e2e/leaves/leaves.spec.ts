import { expect, test } from '@playwright/test';

test.describe('Leaves & Absences Management', () => {
  let userEmail: string;
  let password: string;

  test.beforeEach(async ({ page }) => {
    // Create account and login
    await page.goto('/');

    const timestamp = Date.now();
    const companyName = `Leaves Test ${timestamp}`;
    userEmail = `leaves${timestamp}@example.com`;
    password = 'TestPassword123!';

    // Signup flow
    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    await page.getByLabel("Nom de l'entreprise").fill(companyName);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'France' }).click();
    await page.getByLabel('Secteur').fill('Technology');

    await page.getByLabel('Prénom').fill('Test');
    await page.getByLabel('Nom', { exact: true }).fill('Leaves');
    await page.getByLabel('Email professionnel').fill(userEmail);
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Administrateur' }).click();
    await page.getByPlaceholder('••••••••').first().fill(password);
    await page.getByPlaceholder('••••••••').nth(1).fill(password);

    await page.click('button:has-text("Créer mon compte")');

    // Wait for auto-signin and redirect to onboarding/dashboard
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
  });

  test('should display leaves page with stats', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    // Check leaves title
    await expect(page.getByRole('heading', { name: 'Congés & Absences' })).toBeVisible();

    // Check stats cards
    await expect(page.getByText('Total demandes')).toBeVisible();
    await expect(page.getByText('En attente')).toBeVisible();
    await expect(page.getByText('Approuvées')).toBeVisible();
    await expect(page.getByText('Rejetées')).toBeVisible();

    // Check new request button
    await expect(page.getByText('Nouvelle demande')).toBeVisible();
  });

  test('should display filters section', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    // Check filters are visible
    await expect(page.getByText('Tous les statuts')).toBeVisible();
    await expect(page.getByText('Tous les types')).toBeVisible();
    await expect(page.getByText('Tous les employés')).toBeVisible();
  });

  test('should open create leave request modal', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    // Click new request button
    await page.click('button:has-text("Nouvelle demande")');
    await page.waitForTimeout(500);

    // Modal should be visible
    await expect(page.getByText('Nouvelle demande de congé')).toBeVisible();
    await expect(page.getByText('Créez une demande de congé pour un employé')).toBeVisible();

    // Check form fields
    await expect(page.getByLabel('Employé')).toBeVisible();
    await expect(page.getByLabel('Type de congé')).toBeVisible();
    await expect(page.getByLabel('Date de début')).toBeVisible();
    await expect(page.getByLabel('Date de fin')).toBeVisible();
  });

  test('should close modal on cancel', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    // Open modal
    await page.click('button:has-text("Nouvelle demande")');
    await page.waitForTimeout(500);

    // Click cancel
    await page.click('button:has-text("Annuler")');
    await page.waitForTimeout(500);

    // Modal should be closed
    await expect(page.getByText('Créez une demande de congé pour un employé')).not.toBeVisible();
  });

  test('should display empty state when no leave requests', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    // Should show empty state
    await expect(page.getByText('Aucune demande de congé trouvée')).toBeVisible();
    await expect(page.getByText('Créer une demande')).toBeVisible();
  });

  test('should have zero stats for new account', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    // Check that all stats are 0
    const statsCards = page.locator('.text-3xl.font-semibold.text-white');
    await page.waitForTimeout(1000);

    // All stats should show 0
    const firstStat = await statsCards.first().textContent();
    expect(firstStat).toContain('0');
  });

  test('should filter by status', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    // Click on status filter
    const statusFilter = page.locator('button:has-text("Tous les statuts")').first();
    await statusFilter.click();
    await page.waitForTimeout(500);

    // Should show filter options
    await expect(page.getByRole('option', { name: 'En attente' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Approuvé' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Rejeté' })).toBeVisible();
  });

  test('should filter by leave type', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    // Click on type filter
    const typeFilter = page.locator('button:has-text("Tous les types")').first();
    await typeFilter.click();
    await page.waitForTimeout(500);

    // Should show type options
    await expect(page.getByRole('option', { name: 'Congés payés' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Maladie' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'RTT' })).toBeVisible();
  });

  test('should validate leave request form', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    // Open modal
    await page.click('button:has-text("Nouvelle demande")');
    await page.waitForTimeout(500);

    // Try to submit without filling fields
    await page.click('button:has-text("Créer la demande")');
    await page.waitForTimeout(1000);

    // Form should still be visible (validation failed)
    await expect(page.getByText('Nouvelle demande de congé')).toBeVisible();
  });

  test('should calculate days automatically', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    // Open modal
    await page.click('button:has-text("Nouvelle demande")');
    await page.waitForTimeout(500);

    // Fill dates
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDateObj = new Date(today);
    endDateObj.setDate(endDateObj.getDate() + 4); // 5 days total (excluding weekends = 3-5 business days)
    const endDate = endDateObj.toISOString().split('T')[0];

    await page.getByLabel('Date de début').fill(startDate);
    await page.getByLabel('Date de fin').fill(endDate);

    // Wait for auto-calculation
    await page.waitForTimeout(1000);

    // Days count field should have a value > 0
    const daysInput = page.getByLabel('Nombre de jours');
    const daysValue = await daysInput.inputValue();
    expect(parseInt(daysValue || '0')).toBeGreaterThan(0);
  });
});
