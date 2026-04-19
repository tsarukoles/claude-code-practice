import { Page, FrameLocator } from '@playwright/test';

export class PreviewPanel {
  constructor(private page: Page) {}

  get iframe(): FrameLocator {
    return this.page.frameLocator('iframe[title="Preview"]');
  }

  get welcomeHeading() {
    return this.page.getByRole('heading', { name: /welcome to ui generator/i });
  }

  get noPreviewHeading() {
    return this.page.getByRole('heading', { name: /no preview available/i });
  }

  get previewIframe() {
    return this.page.locator('iframe[title="Preview"]');
  }

  async waitForIframe(timeout = 15_000) {
    await this.previewIframe.waitFor({ state: 'visible', timeout });
  }

  async waitForIframeContent(timeout = 30_000) {
    await this.previewIframe.waitFor({ state: 'visible', timeout });
    // Wait until srcdoc is populated (not empty / not welcome state)
    await this.page.waitForFunction(
      () => {
        const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
        return iframe?.srcdoc && iframe.srcdoc.length > 100;
      },
      { timeout }
    );
  }

  async getIframeBodyText(): Promise<string> {
    return this.iframe.locator('body').innerText();
  }
}
