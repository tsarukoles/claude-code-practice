import { Page } from '@playwright/test';
import { HomePage } from './HomePage';

export class ProjectPage extends HomePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoProject(projectId: string) {
    await this.goto(`/${projectId}`);
  }

  async openProjectSelector() {
    await this.projectSelectorButton.click();
    await this.page.getByPlaceholder('Search projects...').waitFor({ state: 'visible' });
  }

  async searchProjects(query: string) {
    await this.openProjectSelector();
    await this.page.getByPlaceholder('Search projects...').fill(query);
  }

  async selectProject(name: string) {
    await this.openProjectSelector();
    await this.page.getByRole('option', { name }).click();
  }

  async createNewDesign(): Promise<string> {
    await this.newDesignButton.click();
    await this.page.waitForURL(/\/[a-z0-9]+/);
    return this.page.url().split('/').pop()!;
  }

  get currentUrl() {
    return this.page.url();
  }
}
