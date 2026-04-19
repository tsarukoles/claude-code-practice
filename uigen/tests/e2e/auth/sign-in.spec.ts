import { test, expect } from '../../fixtures/index';
import { HomePage } from '../../pages/HomePage';
import { uniqueEmail, PASSWORDS } from '../../utils/test-data';

test.describe('Sign In', () => {
  test('successful sign-in creates session and closes dialog', async ({ page, createUser }) => {
    const user = await createUser();
    const home = new HomePage(page);
    await home.goto();
    await home.openSignIn();

    await home.auth.signIn(user.email, user.password);
    await home.auth.waitForClose();

    await expect(home.signOutButton).toBeVisible();
  });

  test('wrong password shows invalid credentials error', async ({ page, createUser }) => {
    const user = await createUser();
    const home = new HomePage(page);
    await home.goto();
    await home.openSignIn();

    await home.auth.signIn(user.email, 'WrongPassword99!');
    await expect(home.auth.errorMessage).toContainText('Invalid credentials');
  });

  test('unknown email shows invalid credentials error', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openSignIn();

    await home.auth.signIn(uniqueEmail('nonexistent'), PASSWORDS.valid);
    await expect(home.auth.errorMessage).toContainText('Invalid credentials');
  });

  test('sign-out clears session and shows auth buttons', async ({ page, createUser }) => {
    const user = await createUser();
    const home = new HomePage(page);
    await home.goto();
    await home.openSignIn();
    await home.auth.signIn(user.email, user.password);
    await home.auth.waitForClose();

    await home.signOut();

    await expect(home.signInButton).toBeVisible();
    await expect(home.signUpButton).toBeVisible();
    await expect(home.signOutButton).not.toBeVisible();
  });

  test('dialog switches between sign-in and sign-up modes', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openSignIn();

    await home.auth.switchToSignUpLink.click();
    await expect(home.auth.confirmPasswordInput).toBeVisible();

    await home.auth.switchToSignInLink.click();
    await expect(home.auth.confirmPasswordInput).not.toBeVisible();
  });
});
