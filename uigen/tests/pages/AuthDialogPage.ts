import { Page } from '@playwright/test';

export class AuthDialogPage {
  constructor(private page: Page) {}

  get dialog() {
    return this.page.getByRole('dialog');
  }

  get emailInput() {
    return this.page.getByLabel('Email');
  }

  get passwordInput() {
    return this.page.getByLabel('Password').nth(0);
  }

  get confirmPasswordInput() {
    return this.page.getByLabel('Confirm Password');
  }

  get errorMessage() {
    return this.page.locator('.text-red-600');
  }

  get submitSignInButton() {
    return this.dialog.getByRole('button', { name: 'Sign In' });
  }

  get submitSignUpButton() {
    return this.dialog.getByRole('button', { name: 'Sign Up' });
  }

  get switchToSignUpLink() {
    return this.dialog.getByRole('button', { name: 'Sign up' });
  }

  get switchToSignInLink() {
    return this.dialog.getByRole('button', { name: 'Sign in' });
  }

  async waitForOpen() {
    await this.dialog.waitFor({ state: 'visible' });
  }

  async waitForClose() {
    await this.dialog.waitFor({ state: 'hidden' });
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitSignInButton.click();
  }

  async signUp(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.submitSignUpButton.click();
  }

  async signUpWithMismatchedPasswords(email: string, password: string, confirmPassword: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitSignUpButton.click();
  }
}
