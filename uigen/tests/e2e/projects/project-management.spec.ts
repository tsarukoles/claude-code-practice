import { test, expect } from '../../fixtures/index';
import { ProjectPage } from '../../pages/ProjectPage';
import { uniqueProjectName } from '../../utils/test-data';

test.describe('Project Management', () => {
  test('"New Design" creates a project and navigates to it', async ({ authenticatedPage, seedUser, createProject }) => {
    // Need at least one project to land on (so New Design button is visible)
    const project = await createProject(seedUser.id);
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(project.id);

    const newId = await projectPage.createNewDesign();

    expect(authenticatedPage.url()).toContain(newId);
    expect(newId).not.toBe(project.id);
  });

  test('project selector shows existing projects', async ({ authenticatedPage, seedUser, createProject }) => {
    const p1 = await createProject(seedUser.id, uniqueProjectName('Alpha'));
    const p2 = await createProject(seedUser.id, uniqueProjectName('Beta'));
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(p1.id);

    await projectPage.openProjectSelector();

    await expect(authenticatedPage.getByRole('option', { name: new RegExp(p1.name) })).toBeVisible();
    await expect(authenticatedPage.getByRole('option', { name: new RegExp(p2.name) })).toBeVisible();
  });

  test('searching in project selector filters results', async ({ authenticatedPage, seedUser, createProject }) => {
    const needle = await createProject(seedUser.id, uniqueProjectName('NeedleProject'));
    const other = await createProject(seedUser.id, uniqueProjectName('HaystackProject'));
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(needle.id);

    await projectPage.searchProjects('Needle');

    await expect(authenticatedPage.getByRole('option', { name: new RegExp(needle.name) })).toBeVisible();
    await expect(authenticatedPage.getByRole('option', { name: new RegExp(other.name) })).not.toBeVisible();
  });

  test('selecting a project from dropdown navigates to it', async ({ authenticatedPage, seedUser, createProject }) => {
    const p1 = await createProject(seedUser.id, uniqueProjectName('ProjectA'));
    const p2 = await createProject(seedUser.id, uniqueProjectName('ProjectB'));
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.gotoProject(p1.id);

    await projectPage.selectProject(p2.name);

    await expect(authenticatedPage).toHaveURL(new RegExp(p2.id));
  });

  test('unauthenticated user is redirected from project route to home', async ({ page }) => {
    await page.goto('/nonexistent-project-id');
    await expect(page).toHaveURL('/');
  });
});
