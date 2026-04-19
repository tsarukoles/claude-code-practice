import { test, expect } from '../../fixtures/index';
import { ProjectPage } from '../../pages/ProjectPage';
import { CHAT_PROMPTS } from '../../utils/test-data';

test.describe('Code View', () => {
  test('switching to Code tab shows file tree and Monaco editor', async ({ authenticatedPage, seedUser, createProject }) => {
    const project = await createProject(seedUser.id);
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(project.id);

    await projectPage.chat.sendMessageAndWait(CHAT_PROMPTS.counter);
    await projectPage.code.switchToCode();

    await expect(projectPage.code.fileTree).toBeVisible();
    await expect(projectPage.code.monacoEditor).toBeVisible();
  });

  test('generated files appear in file tree', async ({ authenticatedPage, seedUser, createProject }) => {
    const project = await createProject(seedUser.id);
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(project.id);

    await projectPage.chat.sendMessageAndWait(CHAT_PROMPTS.counter);
    await projectPage.code.switchToCode();

    const items = await projectPage.code.getFileTreeItems();
    expect(items.some(item => item.includes('App.jsx'))).toBe(true);
  });

  test('clicking a file in file tree loads it in the editor', async ({ authenticatedPage, seedUser, createProject }) => {
    const project = await createProject(seedUser.id);
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(project.id);

    await projectPage.chat.sendMessageAndWait(CHAT_PROMPTS.counter);
    await projectPage.code.switchToCode();
    await projectPage.code.clickFile('App.jsx');

    await authenticatedPage.waitForTimeout(500);
    const content = await projectPage.code.getEditorContent();
    expect(content.length).toBeGreaterThan(0);
  });

  test('Preview and Code tabs are mutually exclusive', async ({ authenticatedPage, seedUser, createProject }) => {
    const project = await createProject(seedUser.id);
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(project.id);

    await projectPage.code.switchToCode();
    await expect(projectPage.code.codeTab).toHaveAttribute('data-state', 'active');
    await expect(projectPage.code.previewTab).toHaveAttribute('data-state', 'inactive');

    await projectPage.code.switchToPreview();
    await expect(projectPage.code.previewTab).toHaveAttribute('data-state', 'active');
    await expect(projectPage.code.codeTab).toHaveAttribute('data-state', 'inactive');
  });
});
