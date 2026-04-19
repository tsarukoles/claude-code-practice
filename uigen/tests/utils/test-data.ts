export const SEED_USER = {
  email: 'seed-user@playwright-tests.dev',
  password: 'Playwright123!',
};

export function uniqueEmail(prefix = 'test'): string {
  return `${prefix}-${Date.now()}@playwright-tests.dev`;
}

export function uniqueProjectName(prefix = 'Project'): string {
  return `${prefix} ${Date.now()}`;
}

export const PASSWORDS = {
  valid: 'ValidPass123!',
  tooShort: 'abc123',
  mismatch: 'DifferentPass456!',
};

export const CHAT_PROMPTS = {
  counter: 'create a counter component',
  form: 'create a contact form',
  card: 'create a card component',
};
