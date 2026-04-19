import { Page } from '@playwright/test';

export class CodeViewPanel {
  constructor(private page: Page) {}

  get codeTab() {
    return this.page.getByRole('tab', { name: 'Code' });
  }

  get previewTab() {
    return this.page.getByRole('tab', { name: 'Preview' });
  }

  get fileTree() {
    return this.page.locator('[data-testid="file-tree"]');
  }

  get monacoEditor() {
    return this.page.locator('.monaco-editor');
  }

  async switchToCode() {
    await this.codeTab.click();
    await this.monacoEditor.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  }

  async switchToPreview() {
    await this.previewTab.click();
  }

  async clickFile(filename: string) {
    await this.page.locator('[data-testid="file-tree"]').getByText(filename).click();
  }

  async getEditorContent(): Promise<string> {
    return this.monacoEditor.locator('.view-lines').innerText();
  }

  async getFileTreeItems(): Promise<string[]> {
    const items = await this.fileTree.locator('[data-testid="file-tree-item"]').allInnerTexts();
    return items;
  }
}
