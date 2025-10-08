import { expect, test } from '@playwright/test';

test.describe('Account Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create a new account successfully', async ({ page }) => {
    // 1. Click on "Se connecter" to show login card
    await page.click('button:has-text("Se connecter")');

    // 2. Click on "Créer un compte" to open registration dialog
    await page.click('button:has-text("Créer un compte")');

    // 3. Wait for dialog to be visible
    await expect(
      page.getByRole('heading', { name: 'Créer un compte' })
    ).toBeVisible();

    // 4. Fill in company information
    const timestamp = Date.now();
    const companyName = `Test Company ${timestamp}`;
    const userEmail = `test${timestamp}@example.com`;

    await page.getByLabel("Nom de l'entreprise").fill(companyName);

    // Click on country select and choose France
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'France' }).click();

    await page.getByLabel('Secteur').fill('Technology');

    // 5. Fill in user information
    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Email professionnel').fill(userEmail);

    // Click on role select and choose Administrateur
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Administrateur' }).click();

    // 6. Fill in password
    await page.getByPlaceholder('••••••••').first().fill('TestPassword123!');
    await page.getByPlaceholder('••••••••').nth(1).fill('TestPassword123!');

    // 7. Submit the form
    await page.click('button:has-text("Créer mon compte")');

    // 8. Wait for success toast
    await expect(page.getByText('Compte créé').first()).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByText('Vous pouvez maintenant vous connecter').first()
    ).toBeVisible();

    // 9. Verify account was created by checking users table
    // (the dialog closing and email pre-fill is handled by the component)
    // For now, we just verify the toast appeared which confirms success
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    // 1. Open registration dialog
    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    // 2. Try to submit empty form
    await page.click('button:has-text("Créer mon compte")');

    // 3. Verify form doesn't submit and we're still on the dialog
    await expect(
      page.getByRole('heading', { name: 'Créer un compte' })
    ).toBeVisible();
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    // 1. Open registration dialog
    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    // 2. Fill form with mismatched passwords
    const timestamp = Date.now();
    await page.getByLabel("Nom de l'entreprise").fill(`Company ${timestamp}`);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'France' }).click();
    await page.getByLabel('Secteur').fill('Tech');
    await page.getByLabel('Prénom').fill('Test');
    await page.getByLabel('Nom', { exact: true }).fill('User');
    await page
      .getByLabel('Email professionnel')
      .fill(`test${timestamp}@test.com`);
    await page.getByPlaceholder('••••••••').first().fill('Password123!');
    await page.getByPlaceholder('••••••••').nth(1).fill('DifferentPass123!');

    // 3. Submit form
    await page.click('button:has-text("Créer mon compte")');

    // 4. Verify error message for password mismatch
    await expect(page.getByText(/Passwords do not match/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('should toggle password visibility', async ({ page }) => {
    // 1. Open registration dialog
    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    // Wait for dialog to be fully rendered
    await expect(
      page.getByRole('heading', { name: 'Créer un compte' })
    ).toBeVisible();

    // 2. Find the dialog and password input within it
    const dialog = page.getByRole('dialog');
    const passwordInput = dialog.locator('input[name="user.password"]');

    // 3. Verify initial type is password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // 4. Find the toggle button next to the password input (within dialog context)
    const toggleButton = dialog.getByLabel('Afficher le mot de passe').first();
    await expect(toggleButton).toBeVisible();

    // 5. Click the toggle button to show password
    await toggleButton.click({ force: true });

    // 6. Wait a bit for state update
    await page.waitForTimeout(200);

    // 7. Verify type changed to text
    await expect(passwordInput).toHaveAttribute('type', 'text', {
      timeout: 2000,
    });
  });

  test('should prevent duplicate company name', async ({ page }) => {
    const timestamp = Date.now();
    const companyName = `Duplicate Company ${timestamp}`;
    const firstEmail = `first${timestamp}@test.com`;

    // Create first account
    await page.click('button:has-text("Se connecter")');
    await page.click('button:has-text("Créer un compte")');

    await page.getByLabel("Nom de l'entreprise").fill(companyName);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'France' }).click();
    await page.getByLabel('Secteur').fill('Tech');
    await page.getByLabel('Prénom').fill('First');
    await page.getByLabel('Nom', { exact: true }).fill('User');
    await page.getByLabel('Email professionnel').fill(firstEmail);
    await page.getByPlaceholder('••••••••').first().fill('Password123!');
    await page.getByPlaceholder('••••••••').nth(1).fill('Password123!');

    await page.click('button:has-text("Créer mon compte")');
    await expect(page.getByText('Compte créé').first()).toBeVisible({
      timeout: 10000,
    });

    // Wait for toast to disappear
    await page.waitForTimeout(2000);

    // Try to create second account with same company name
    await page.click('button:has-text("Créer un compte")');

    const secondEmail = `second${timestamp}@test.com`;
    await page.getByLabel("Nom de l'entreprise").fill(companyName);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'France' }).click();
    await page.getByLabel('Secteur').fill('Tech');
    await page.getByLabel('Prénom').fill('Second');
    await page.getByLabel('Nom', { exact: true }).fill('User');
    await page.getByLabel('Email professionnel').fill(secondEmail);
    await page.getByPlaceholder('••••••••').first().fill('Password123!');
    await page.getByPlaceholder('••••••••').nth(1).fill('Password123!');

    await page.click('button:has-text("Créer mon compte")');

    // Verify error message
    await expect(
      page.getByText(/existe déjà|already exists/i).first()
    ).toBeVisible({
      timeout: 10000,
    });
  });
});
