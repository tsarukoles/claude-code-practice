import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AuthDialogPage } from './AuthDialogPage';
import { ChatPanel } from './ChatPanel';
import { PreviewPanel } from './PreviewPanel';
import { CodeViewPanel } from './CodeViewPanel';

export class HomePage extends BasePage {
  readonly auth: AuthDialogPage;
  readonly chat: ChatPanel;
  readonly preview: PreviewPanel;
  readonly code: CodeViewPanel;

  constructor(page: Page) {
    super(page);
    this.auth = new AuthDialogPage(page);
    this.chat = new ChatPanel(page);
    this.preview = new PreviewPanel(page);
    this.code = new CodeViewPanel(page);
  }

  async openSignIn() {
    await this.signInButton.click();
    await this.auth.waitForOpen();
  }

  async openSignUp() {
    await this.signUpButton.click();
    await this.auth.waitForOpen();
  }

  async signOut() {
    await this.signOutButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  get heading() {
    return this.page.getByRole('heading', { name: 'React Component Generator' });
  }
}
