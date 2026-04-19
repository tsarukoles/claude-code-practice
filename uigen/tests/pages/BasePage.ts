import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  get signInButton() {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  get signUpButton() {
    return this.page.getByRole('button', { name: 'Sign Up' });
  }

  get newDesignButton() {
    return this.page.getByRole('button', { name: 'New Design' });
  }

  get signOutButton() {
    return this.page.getByRole('button', { name: 'Sign out' });
  }

  get projectSelectorButton() {
    return this.page.getByRole('combobox');
  }
}
