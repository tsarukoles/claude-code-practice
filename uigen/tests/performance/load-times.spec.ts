import { test, expect } from '../fixtures/index';
import { HomePage } from '../pages/HomePage';
import { CHAT_PROMPTS } from '../utils/test-data';

const THRESHOLDS = {
  fcp: 3_000,
  lcp: 5_000,
  chatFirstToken: 5_000,
  previewRender: 15_000,
};

test.describe('Performance', () => {
  test('homepage FCP is under threshold', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByName('first-contentful-paint');
      return entries.length ? entries[0].startTime : null;
    });

    if (fcp !== null) {
      expect(fcp).toBeLessThan(THRESHOLDS.fcp);
    }
  });

  test('homepage navigation timing is within threshold', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const timing = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return nav ? nav.domContentLoadedEventEnd - nav.startTime : null;
    });

    if (timing !== null) {
      expect(timing).toBeLessThan(THRESHOLDS.lcp);
    }
  });

  test('chat receives first token within threshold', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const start = Date.now();
    await home.chat.sendMessage(CHAT_PROMPTS.counter);

    // Wait for at least one assistant message to start appearing
    await page.locator('[data-testid="message-item"][data-role="assistant"]')
      .first()
      .waitFor({ state: 'visible', timeout: THRESHOLDS.chatFirstToken });

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(THRESHOLDS.chatFirstToken);
  });

  test('preview renders within threshold after component generation', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const start = Date.now();
    await home.chat.sendMessageAndWait(CHAT_PROMPTS.counter);
    await home.preview.waitForIframeContent(THRESHOLDS.previewRender);

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(THRESHOLDS.previewRender);
  });
});
