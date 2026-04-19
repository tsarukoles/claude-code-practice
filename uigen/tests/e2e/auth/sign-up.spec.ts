import { test, expect } from '../../fixtures/index';
import { HomePage } from '../../pages/HomePage';
import { uniqueEmail, PASSWORDS } from '../../utils/test-data';

test.describe('Sign Up', () => {
  test('successful sign-up creates session and closes dialog', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openSignUp();

    await home.auth.signUp(uniqueEmail(), PASSWORDS.valid);
    await home.auth.waitForClose();

    await expect(home.signOutButton).toBeVisible();
    await expect(home.signUpButton).not.toBeVisible();
  });

  test('duplicate email shows error', async ({ page, createUser }) => {
    const user = await createUser();
    const home = new HomePage(page);
    await home.goto();
    await home.openSignUp();

    await home.auth.signUp(user.email, PASSWORDS.valid);
    await expect(home.auth.errorMessage).toContainText('Email already registered');
  });

  test('password shorter than 8 chars prevents form submission', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openSignUp();

    await home.auth.signUp(uniqueEmail(), PASSWORDS.tooShort);
    // Browser's minLength constraint blocks submission — dialog stays open
    await expect(home.auth.dialog).toBeVisible();
    await expect(home.signOutButton).not.toBeVisible();
  });

  test('mismatched passwords shows error', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openSignUp();

    await home.auth.signUpWithMismatchedPasswords(uniqueEmail(), PASSWORDS.valid, PASSWORDS.mismatch);
    await expect(home.auth.errorMessage).toContainText('Passwords do not match');
  });

  test('empty fields keeps dialog open', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openSignUp();

    await home.auth.submitSignUpButton.click();
    await expect(home.auth.dialog).toBeVisible();
  });
});
