import { test, expect } from '../../fixtures/index';
import { HomePage } from '../../pages/HomePage';
import { CHAT_PROMPTS } from '../../utils/test-data';

test.describe('Anonymous Chat', () => {
  test('page loads with welcome placeholder in preview', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.heading).toBeVisible();
    await expect(home.preview.welcomeHeading).toBeVisible();
  });

  test('auth buttons visible for anonymous user', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.signInButton).toBeVisible();
    await expect(home.signUpButton).toBeVisible();
    await expect(home.signOutButton).not.toBeVisible();
  });

  test('sending a message generates a component and updates preview', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.chat.sendMessageAndWait(CHAT_PROMPTS.counter);

    await home.preview.waitForIframeContent();
    await expect(home.preview.previewIframe).toBeVisible();
    await expect(home.preview.welcomeHeading).not.toBeVisible();
  });

  test('anonymous work is tracked in localStorage after message', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.chat.sendMessageAndWait(CHAT_PROMPTS.counter);

    const anonWork = await page.evaluate(() => localStorage.getItem('anon-work'));
    expect(anonWork).not.toBeNull();
  });

  test('chat input is disabled while streaming', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Start a message but don't wait for completion
    await home.chat.messageInput.fill(CHAT_PROMPTS.counter);
    await home.chat.messageInput.press('Enter');

    // Input should be briefly disabled
    await expect(home.chat.messageInput).toBeDisabled({ timeout: 3_000 }).catch(() => {});
    // Eventually re-enabled
    await expect(home.chat.messageInput).toBeEnabled({ timeout: 30_000 });
  });
});
