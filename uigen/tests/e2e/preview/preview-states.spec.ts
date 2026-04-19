import { test, expect } from '../../fixtures/index';
import { HomePage } from '../../pages/HomePage';
import { CHAT_PROMPTS } from '../../utils/test-data';

test.describe('Preview States', () => {
  test('initial load shows welcome placeholder', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.preview.welcomeHeading).toBeVisible();
    await expect(home.preview.previewIframe).not.toBeVisible();
  });

  test('after generation, iframe is shown and welcome is hidden', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.chat.sendMessageAndWait(CHAT_PROMPTS.counter);
    await home.preview.waitForIframeContent();

    await expect(home.preview.previewIframe).toBeVisible();
    await expect(home.preview.welcomeHeading).not.toBeVisible();
  });

  test('switching from Preview to Code tab hides iframe', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.chat.sendMessageAndWait(CHAT_PROMPTS.counter);
    await home.preview.waitForIframeContent();

    await home.code.switchToCode();

    await expect(home.preview.previewIframe).not.toBeVisible();
    await expect(home.code.monacoEditor).toBeVisible();
  });

  test('switching back to Preview tab shows iframe again', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.chat.sendMessageAndWait(CHAT_PROMPTS.counter);
    await home.preview.waitForIframeContent();
    await home.code.switchToCode();
    await home.code.switchToPreview();

    await expect(home.preview.previewIframe).toBeVisible();
  });
});
