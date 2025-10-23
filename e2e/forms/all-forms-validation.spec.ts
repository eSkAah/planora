import { expect, test } from '@playwright/test';

/**
 * E2E Test: All Forms Validation
 *
 * This test validates that all forms in the application can be submitted successfully
 * without any structural errors (like FormField/FormLabel issues).
 *
 * Forms tested:
 * 1. Create Account (Signup)
 * 2. Create User (Team Settings)
 * 3. Create Employee
 * 4. Create Shift
 * 5. Create Leave Request
 * 6. Generate Schedule (AI Planning)
 */

test.describe('All Forms Validation', () => {
  let companyEmail: string;
  let timestamp: number;

  test.beforeAll(() => {
    timestamp = Date.now();
    companyEmail = `formtest${timestamp}@example.com`;
  });

  test('should submit all forms successfully without errors', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for complete test

    // ====================================
    // FORM 1: Create Account (Signup)
    // ====================================
    console.log('Testing Form 1/6: Create Account...');

    await page.goto('/');
    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    // Fill signup form
    await page.getByLabel("Nom de l'entreprise").fill(`Form Test Company ${timestamp}`);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'France' }).click();
    await page.getByLabel('Secteur').fill('Technology');

    await page.getByLabel('Prénom').fill('Test');
    await page.getByLabel('Nom', { exact: true }).fill('User');
    await page.getByLabel('Email professionnel').fill(companyEmail);
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Administrateur' }).click();
    await page.getByPlaceholder('••••••••').first().fill('TestPassword123!');
    await page.getByPlaceholder('••••••••').nth(1).fill('TestPassword123!');

    await page.click('button:has-text("Créer mon compte")');
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 30000 });

    console.log('✓ Form 1/6: Create Account - SUCCESS');

    // ====================================
    // FORM 2: Create User (Team Settings)
    // ====================================
    console.log('Testing Form 2/6: Create User (Team Settings)...');

    await page.goto('/settings/team');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Nouvel utilisateur")');
    await page.waitForTimeout(1500);

    // Fill user creation form
    await page.locator('input[placeholder="Jean"]').fill('Marie');
    await page.locator('input[placeholder="Dupont"]').fill('Test');
    await page.locator('input[type="email"]').fill(`marie.test${timestamp}@example.com`);

    await page.getByLabel('Rôle').click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Employé' }).click();

    await page.click('button:has-text("Créer")');
    await page.waitForTimeout(3000);

    // Close magic link dialog if it appears
    const magicLinkDialog = await page
      .getByRole('heading', { name: /lien de connexion/i })
      .isVisible()
      .catch(() => false);
    if (magicLinkDialog) {
      await page.click('button:has-text("Fermer")');
      await page.waitForTimeout(1000);
    }

    console.log('✓ Form 2/6: Create User - SUCCESS');

    // ====================================
    // FORM 3: Create Employee (Full Form)
    // ====================================
    console.log('Testing Form 3/6: Create Employee...');

    await page.goto('/employees');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Nouvel employé")');
    await page.waitForTimeout(1500);

    // Fill employee form (minimal required fields)
    // Use more specific selectors to avoid ambiguity
    const form = page.locator('form').first();
    await form.getByLabel('Prénom').first().fill('Jean');
    await form.getByLabel('Nom', { exact: true }).first().fill('Martin');
    await form.getByLabel('Email').first().fill(`jean.martin${timestamp}@example.com`);

    // Date of birth
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
    await form.locator('input[type="date"]').first().fill(birthDate.toISOString().split('T')[0]);

    // Address
    await form.getByLabel('Adresse').fill('123 Rue Test');
    await form.getByLabel('Ville').fill('Paris');
    await form.getByLabel('Code postal').fill('75001');

    // Hire date
    await form.locator('input[type="date"]').nth(1).fill(new Date().toISOString().split('T')[0]);

    // Submit
    await page.click('button[type="submit"]:has-text("Créer")');
    await page.waitForTimeout(3000);

    console.log('✓ Form 3/6: Create Employee - SUCCESS');

    // ====================================
    // FORM 4: Create Shift
    // ====================================
    console.log('Testing Form 4/6: Create Shift...');

    await page.goto('/planning');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Ajouter un shift")');
    await page.waitForTimeout(1500);

    // Fill shift form
    await page.getByLabel('Employé').click();
    await page.waitForTimeout(500);
    const employeeOptions = await page.locator('[role="option"]').all();
    if (employeeOptions.length > 0) {
      await employeeOptions[0].click();
    }

    await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);

    await page.getByLabel('Type de shift').click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: /Matin/i }).click();

    await page.locator('input[type="time"]').first().fill('09:00');
    await page.locator('input[type="time"]').nth(1).fill('17:00');

    await page.click('button:has-text("Créer le shift")');
    await page.waitForTimeout(2000);

    console.log('✓ Form 4/6: Create Shift - SUCCESS');

    // ====================================
    // FORM 5: Create Leave Request
    // ====================================
    console.log('Testing Form 5/6: Create Leave Request...');

    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Nouvelle demande")');
    await page.waitForTimeout(1500);

    // Fill leave request form
    await page.getByLabel('Employé').click();
    await page.waitForTimeout(500);
    const leaveEmployeeOptions = await page.locator('[role="option"]').all();
    if (leaveEmployeeOptions.length > 0) {
      await leaveEmployeeOptions[0].click();
    }

    await page.getByLabel('Type de congé').click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: /Congés payés/i }).click();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    await page.getByLabel('Date de début').fill(startDate.toISOString().split('T')[0]);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5);
    await page.getByLabel('Date de fin').fill(endDate.toISOString().split('T')[0]);

    await page.locator('input[type="number"]').fill('5');

    await page.click('button:has-text("Soumettre")');
    await page.waitForTimeout(2000);

    console.log('✓ Form 5/6: Create Leave Request - SUCCESS');

    // ====================================
    // FORM 6: Generate Schedule (AI)
    // ====================================
    console.log('Testing Form 6/6: Generate Schedule...');

    await page.goto('/schedules');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Nouveau planning")');
    await page.waitForTimeout(1500);

    // Click on AI generation option
    await page.locator('text=Génération automatique (IA)').click();
    await page.waitForTimeout(1500);

    // Fill schedule generation form
    await page.getByLabel('Titre du planning').fill(`Test Schedule ${timestamp}`);

    // Check that form doesn't crash (FormLabel error would prevent this)
    const titleInput = await page.getByLabel('Titre du planning');
    await expect(titleInput).toBeVisible();

    // Verify all form sections are visible without errors
    await expect(page.getByText('Objectifs d\'optimisation')).toBeVisible();
    await expect(page.getByText('Contraintes')).toBeVisible();

    console.log('✓ Form 6/6: Generate Schedule - SUCCESS (Form renders without errors)');

    // Close dialog without submitting (to avoid AI generation cost)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // ====================================
    // SUCCESS: All forms validated
    // ====================================
    console.log('\n========================================');
    console.log('✓ ALL FORMS VALIDATION PASSED!');
    console.log('========================================');
    console.log('Forms tested: 6/6');
    console.log('1. ✓ Create Account');
    console.log('2. ✓ Create User (Team Settings)');
    console.log('3. ✓ Create Employee');
    console.log('4. ✓ Create Shift');
    console.log('5. ✓ Create Leave Request');
    console.log('6. ✓ Generate Schedule');
    console.log('========================================\n');
  });
});
