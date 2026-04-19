import { test, expect } from '../../fixtures/index';
import { ProjectPage } from '../../pages/ProjectPage';
import { CHAT_PROMPTS } from '../../utils/test-data';

test.describe('Authenticated Chat', () => {
  test('sending a message generates a component in preview', async ({ authenticatedPage, seedUser, createProject }) => {
    const project = await createProject(seedUser.id);
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(project.id);

    await projectPage.chat.sendMessageAndWait(CHAT_PROMPTS.counter);

    await projectPage.preview.waitForIframeContent();
    await expect(projectPage.preview.previewIframe).toBeVisible();
  });

  test('project is saved to DB after generation', async ({ authenticatedPage, seedUser, createProject, getProjectsByUser }) => {
    const project = await createProject(seedUser.id);
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(project.id);

    await projectPage.chat.sendMessageAndWait(CHAT_PROMPTS.counter);

    // Wait a moment for onFinish to persist
    await authenticatedPage.waitForTimeout(1_000);

    const projects = await getProjectsByUser(seedUser.id);
    const saved = projects.find(p => p.id === project.id);
    expect(saved).toBeDefined();
    // Messages should have been updated (no longer empty array)
    const { getTestPrisma } = await import('../../utils/db');
    const full = await getTestPrisma().project.findUnique({ where: { id: project.id } });
    expect(JSON.parse(full!.messages).length).toBeGreaterThan(0);
  });

  test('sign-out button is visible for authenticated user', async ({ authenticatedPage, seedUser, createProject }) => {
    const project = await createProject(seedUser.id);
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(project.id);

    await expect(projectPage.signOutButton).toBeVisible();
    await expect(projectPage.signInButton).not.toBeVisible();
  });
});
