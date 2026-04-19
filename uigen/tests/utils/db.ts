import { PrismaClient } from '../../src/generated/prisma';

const TEST_DB_URL = 'file:./prisma/test.db';

let _client: PrismaClient | null = null;

export function getTestPrisma(): PrismaClient {
  if (!_client) {
    _client = new PrismaClient({
      datasources: { db: { url: TEST_DB_URL } },
    });
  }
  return _client;
}

export async function disconnectTestPrisma(): Promise<void> {
  if (_client) {
    await _client.$disconnect();
    _client = null;
  }
}

export async function cleanTestDb(): Promise<void> {
  const prisma = getTestPrisma();
  await prisma.user.deleteMany();
}

export async function findUserByEmail(email: string) {
  return getTestPrisma().user.findUnique({ where: { email } });
}

export async function findProjectsByUserId(userId: string) {
  return getTestPrisma().project.findMany({ where: { userId } });
}
