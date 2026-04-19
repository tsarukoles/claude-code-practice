import { Page } from '@playwright/test';

export class ChatPanel {
  constructor(private page: Page) {}

  get messageInput() {
    return this.page.getByPlaceholder('Describe the React component you want to create...');
  }

  get sendButton() {
    return this.page.locator('button[type="submit"]');
  }

  get messageList() {
    return this.page.locator('[data-testid="message-list"]');
  }

  get loadingIndicator() {
    return this.page.locator('[data-testid="loading-indicator"]');
  }

  get allMessages() {
    return this.page.locator('[data-testid="message-item"]');
  }

  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.messageInput.press('Enter');
  }

  async waitForResponse(timeout = 30_000) {
    // Wait for loading indicator to appear then disappear
    await this.loadingIndicator.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout });
  }

  async sendMessageAndWait(text: string, timeout = 30_000) {
    await this.sendMessage(text);
    await this.waitForResponse(timeout);
  }

  async getLastAssistantMessage(): Promise<string> {
    const messages = this.page.locator('[data-testid="message-item"][data-role="assistant"]');
    const count = await messages.count();
    if (count === 0) return '';
    return messages.nth(count - 1).innerText();
  }
}
