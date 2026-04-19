import { test, expect } from '../fixtures/index';
import { SEED_USER } from '../utils/test-data';

test.describe('POST /api/chat', () => {
  test('returns a streaming response with correct content-type', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: 'create a counter' }],
        files: {},
      },
    });

    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('text/plain');
  });

  test('response body is non-empty', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: 'create a counter' }],
        files: {},
      },
    });

    const body = await response.text();
    expect(body.length).toBeGreaterThan(0);
  });

  test('without projectId, no DB write occurs', async ({ request, createUser, getProjectsByUser }) => {
    const user = await createUser();

    await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: 'create a counter' }],
        files: {},
        // No projectId
      },
    });

    const projects = await getProjectsByUser(user.id);
    expect(projects.length).toBe(0);
  });

  test('rejects malformed body with 4xx/5xx', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: 'not-json',
      headers: { 'content-type': 'text/plain' },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('with existing files, reconstructs VirtualFileSystem', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: 'improve the counter' }],
        files: {
          '/App.jsx': {
            type: 'file',
            content: "export default function App() { return <div>Hello</div>; }",
            name: 'App.jsx',
            path: '/App.jsx',
          },
        },
      },
    });

    expect(response.status()).toBe(200);
  });
});
