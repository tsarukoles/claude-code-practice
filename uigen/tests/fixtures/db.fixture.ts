import { test as base } from '@playwright/test';
import { getTestPrisma, findUserByEmail, findProjectsByUserId } from '../utils/db';
import { SEED_USER, uniqueEmail, uniqueProjectName, PASSWORDS } from '../utils/test-data';

interface DbFixtures {
  seedUser: { id: string; email: string; password: string };
  createUser: (email?: string, password?: string) => Promise<{ id: string; email: string; password: string }>;
  createProject: (userId: string, name?: string) => Promise<{ id: string; name: string }>;
  getProjectsByUser: (userId: string) => Promise<{ id: string; name: string }[]>;
}

export const test = base.extend<DbFixtures>({
  seedUser: async ({}, use) => {
    const user = await findUserByEmail(SEED_USER.email);
    if (!user) throw new Error('Seed user not found — did global-setup run?');
    await use({ id: user.id, email: user.email, password: SEED_USER.password });
  },

  createUser: async ({}, use) => {
    const created: string[] = [];
    const factory = async (email = uniqueEmail(), password = PASSWORDS.valid) => {
      const bcrypt = await import('bcrypt');
      const hashed = await bcrypt.hash(password, 10);
      const user = await getTestPrisma().user.create({ data: { email, password: hashed } });
      created.push(user.id);
      return { id: user.id, email: user.email, password };
    };
    await use(factory);
    // Cleanup
    if (created.length) {
      await getTestPrisma().user.deleteMany({ where: { id: { in: created } } });
    }
  },

  createProject: async ({}, use) => {
    const created: string[] = [];
    const factory = async (userId: string, name = uniqueProjectName()) => {
      const project = await getTestPrisma().project.create({
        data: { name, userId, messages: '[]', data: '{}' },
      });
      created.push(project.id);
      return { id: project.id, name: project.name };
    };
    await use(factory);
    if (created.length) {
      await getTestPrisma().project.deleteMany({ where: { id: { in: created } } });
    }
  },

  getProjectsByUser: async ({}, use) => {
    await use(findProjectsByUserId);
  },
});
