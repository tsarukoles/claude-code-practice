import { test, expect } from '../fixtures/index';
import { HomePage } from '../pages/HomePage';
import { CHAT_PROMPTS } from '../utils/test-data';

test.describe('Visual Regression', () => {
  test('homepage initial state matches snapshot', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.preview.welcomeHeading).toBeVisible();

    await expect(page).toHaveScreenshot('homepage-initial.png', { maxDiffPixelRatio: 0.02 });
  });

  test('sign-in dialog matches snapshot', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openSignIn();
    await home.auth.waitForOpen();

    await expect(page).toHaveScreenshot('auth-dialog-signin.png', { maxDiffPixelRatio: 0.02 });
  });

  test('sign-up dialog matches snapshot', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openSignUp();
    await home.auth.waitForOpen();

    await expect(page).toHaveScreenshot('auth-dialog-signup.png', { maxDiffPixelRatio: 0.02 });
  });

  test('homepage with generated component matches snapshot', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.chat.sendMessageAndWait(CHAT_PROMPTS.counter);
    await home.preview.waitForIframeContent();

    await expect(page).toHaveScreenshot('homepage-with-component.png', { maxDiffPixelRatio: 0.05 });
  });
});
