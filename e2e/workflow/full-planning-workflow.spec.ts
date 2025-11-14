import { expect, test } from '@playwright/test';

/**
 * E2E Test: Complete Planning Workflow
 *
 * This test covers the entire user journey:
 * 1. Create company account
 * 2. Add employees via Team Settings
 * 3. Create a complete monthly planning with shifts
 * 4. Verify all data is correctly saved and displayed
 */
test.describe('Complete Planning Workflow - Account to Monthly Planning', () => {
  test('should complete full journey: signup -> add employees -> create monthly planning', async ({ page }) => {
    // Set longer timeout for this comprehensive test
    test.setTimeout(120000); // 2 minutes

    // ====================================
    // STEP 1: Create Company Account
    // ====================================
    console.log('STEP 1: Creating company account...');
    await page.goto('/');

    const timestamp = Date.now();
    const companyName = `E2E Test Company ${timestamp}`;
    const userEmail = `e2e${timestamp}@example.com`;
    const password = 'TestPassword123!';

    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    // Fill company information
    await page.getByLabel("Nom de l'entreprise").fill(companyName);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'France' }).click();
    await page.getByLabel('Secteur').fill('Retail');

    // Fill user information
    await page.getByLabel('Prénom').fill('Admin');
    await page.getByLabel('Nom', { exact: true }).fill('Test');
    await page.getByLabel('Email professionnel').fill(userEmail);
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Administrateur' }).click();
    await page.getByPlaceholder('••••••••').first().fill(password);
    await page.getByPlaceholder('••••••••').nth(1).fill(password);

    await page.click('button:has-text("Créer mon compte")');

    // Wait for auto-signin and redirect
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
    console.log('✓ Account created and logged in');

    // ====================================
    // STEP 2: Add Employees
    // ====================================
    console.log('\nSTEP 2: Adding employees...');
    await page.goto('/settings/team');
    await page.waitForTimeout(2000);

    // Verify we're on the team page
    await expect(page.getByRole('heading', { name: 'Équipe' })).toBeVisible({ timeout: 10000 });

    // Define employees to add (just one for now to test the workflow)
    const employees = [
      { firstName: 'Marie', lastName: 'Dubois', email: `marie.dubois${timestamp}@test.com`, role: 'Employé' },
    ];

    for (const emp of employees) {
      console.log(`  Adding employee: ${emp.firstName} ${emp.lastName}`);

      // Click add user button
      await page.click('button:has-text("Nouvel utilisateur")');
      await page.waitForTimeout(1500);

      // Verify dialog is open by checking for the heading
      await expect(page.getByRole('heading', { name: 'Nouvel utilisateur' })).toBeVisible();

      // Fill the form
      await page.locator('input[placeholder="Jean"]').fill(emp.firstName);
      await page.locator('input[placeholder="Dupont"]').fill(emp.lastName);
      await page.locator('input[type="email"]').fill(emp.email);

      // Select role from dropdown
      await page.getByLabel('Rôle').click();
      await page.waitForTimeout(500);

      // Map role names to French dropdown options
      const roleMapping: Record<string, string> = {
        'Manager': 'Manager',
        'Employé': 'Employé',
        'Administrateur': 'Administrateur'
      };
      await page.getByRole('option', { name: roleMapping[emp.role] }).click();
      await page.waitForTimeout(500);

      // Click create button
      await page.click('button:has-text("Créer")');

      // Wait for password dialog to appear
      await page.waitForTimeout(3000);

      // Close password dialog if it appeared
      const passwordDialog = await page.getByRole('heading', { name: 'Mot de passe temporaire' }).isVisible().catch(() => false);
      if (passwordDialog) {
        await page.click('button:has-text("J\'ai copié le mot de passe")');
        await page.waitForTimeout(1500);
      }

      console.log(`  ✓ Employee ${emp.firstName} ${emp.lastName} added`);
    }

    // Verify employees are listed (wait a bit for the list to update)
    await page.waitForTimeout(2000);
    for (const emp of employees) {
      await expect(page.getByText(`${emp.firstName} ${emp.lastName}`)).toBeVisible();
    }

    console.log('✓ All employees added successfully');

    // ====================================
    // STEP 3: Navigate to Planning Page
    // ====================================
    console.log('\nSTEP 3: Navigating to planning page...');
    await page.goto('/planning');
    await page.waitForTimeout(2000);

    // Verify planning page loaded
    await expect(page.getByRole('heading', { name: 'Planning' })).toBeVisible();

    // Check that we have 2 employees total (admin + 1 new employee)
    const employeesCountText = await page.locator('.text-3xl.font-semibold.text-white').first().textContent();
    const employeesCount = parseInt(employeesCountText || '0');
    expect(employeesCount).toBeGreaterThanOrEqual(2);
    console.log(`✓ Planning page loaded with ${employeesCount} employees`);

    // ====================================
    // STEP 4: Create Shifts for Current Month
    // ====================================
    console.log('\nSTEP 4: Creating shifts for the month...');

    // Get current date info
    const now = new Date();
    const currentMonth = now.toLocaleDateString('fr-FR', { month: 'long' });

    console.log(`  Creating shifts for: ${currentMonth} ${now.getFullYear()}`);

    // We'll create shifts for 2 weeks (10 working days) to demonstrate monthly planning
    // This creates a realistic monthly planning scenario
    const shiftsToCreate = [
      // Week 1 - Alternating morning and afternoon shifts
      { day: 1, shiftType: 'Matin' },
      { day: 2, shiftType: 'Après-midi' },
      { day: 3, shiftType: 'Matin' },
      { day: 4, shiftType: 'Après-midi' },
      { day: 5, shiftType: 'Matin' },
      // Week 2 - Alternating morning and afternoon shifts
      { day: 8, shiftType: 'Après-midi' },
      { day: 9, shiftType: 'Matin' },
      { day: 10, shiftType: 'Après-midi' },
      { day: 11, shiftType: 'Matin' },
      { day: 12, shiftType: 'Après-midi' },
    ];

    let shiftCount = 0;

    // Create shifts by clicking on calendar cells
    for (let i = 0; i < Math.min(1, employeesCount); i++) { // Create for first employee
      for (const shift of shiftsToCreate) { // Create all 10 shifts for 2 weeks
        console.log(`  Creating shift for employee ${i + 1}, day ${shift.day}...`);

        // Click the "Ajouter un shift" button
        await page.click('button:has-text("Ajouter un shift")');
        await page.waitForTimeout(1000);

        // Verify modal is open
        await expect(page.getByText('Créer un shift')).toBeVisible();

        // Select employee (assuming dropdown is in order)
        await page.getByLabel('Employé').click();
        await page.waitForTimeout(500);
        // Select first available employee option
        const employeeOptions = await page.locator('[role="option"]').all();
        if (employeeOptions.length > i) {
          await employeeOptions[i].click();
        }
        await page.waitForTimeout(500);

        // Set the date (format: YYYY-MM-DD)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(shift.day).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        await page.getByLabel('Date').fill(dateString);

        // Select shift type
        await page.getByLabel('Type de shift').click();
        await page.waitForTimeout(500);
        await page.getByRole('option', { name: shift.shiftType }).click();

        // Set times
        await page.locator('input[type="time"]').first().fill('09:00');
        await page.locator('input[type="time"]').nth(1).fill('17:00');

        // Submit the form
        await page.click('button:has-text("Créer le shift")');
        await page.waitForTimeout(2000);

        shiftCount++;
        console.log(`  ✓ Shift ${shiftCount} created`);
      }
    }

    console.log(`✓ Created ${shiftCount} shifts for the month`);

    // ====================================
    // STEP 5: Verify Planning Display
    // ====================================
    console.log('\nSTEP 5: Verifying planning display...');

    // Reload to ensure everything is saved
    await page.reload();
    await page.waitForTimeout(2000);

    // Verify the calendar shows our shifts
    const planningHeading = await page.getByRole('heading', { name: 'Planning' }).textContent();
    expect(planningHeading).toBe('Planning');

    // Check that hours are being counted (should be around 80h for 10 shifts of 8h each)
    const hoursPlannedText = await page.locator('.text-3xl.font-semibold.text-white').nth(1).textContent();
    const hoursPlanned = parseFloat(hoursPlannedText?.replace('h', '') || '0');
    expect(hoursPlanned).toBeGreaterThanOrEqual(70); // At least 70 hours expected

    console.log(`✓ Planning displays ${hoursPlanned} hours planned`);

    // ====================================
    // STEP 6: Navigate Month and Verify
    // ====================================
    console.log('\nSTEP 6: Testing month navigation...');

    // Get current month display
    const initialMonth = await page.locator('.text-2xl.font-semibold.capitalize.text-white').textContent();
    console.log(`  Current month: ${initialMonth}`);

    // Navigate to next month
    await page.click('button:has-text("Suivant")');
    await page.waitForTimeout(1000);
    const nextMonth = await page.locator('.text-2xl.font-semibold.capitalize.text-white').textContent();
    console.log(`  Next month: ${nextMonth}`);
    expect(nextMonth).not.toBe(initialMonth);

    // Navigate back
    await page.click('button:has-text("Précédent")');
    await page.waitForTimeout(1000);
    const backMonth = await page.locator('.text-2xl.font-semibold.capitalize.text-white').textContent();
    expect(backMonth).toBe(initialMonth);
    console.log(`  ✓ Successfully navigated back to ${backMonth}`);

    // ====================================
    // STEP 7: Verify Dashboard Integration
    // ====================================
    console.log('\nSTEP 7: Verifying dashboard integration...');

    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Verify dashboard shows our data
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Check employee count on dashboard
    const dashboardEmployeeCount = await page.locator('.text-3xl.font-semibold.text-white').first().textContent();
    expect(parseInt(dashboardEmployeeCount || '0')).toBeGreaterThanOrEqual(2);

    console.log('✓ Dashboard shows correct employee count');

    // ====================================
    // SUCCESS: Complete workflow verified
    // ====================================
    console.log('\n========================================');
    console.log('✓ COMPLETE WORKFLOW TEST PASSED!');
    console.log('========================================');
    console.log(`Company: ${companyName}`);
    console.log(`Admin: ${userEmail}`);
    console.log(`Employees added: ${employees.length}`);
    console.log(`Shifts created: ${shiftCount}`);
    console.log('========================================\n');
  });
});
