import { test as base, expect as baseExpect, APIResponse } from '@playwright/test';

/**
 * Custom matcher: toHaveApiStatus.
 *
 * On failure it prints the endpoint, the expected and actual status, and a
 * short excerpt of the response body, so a failing test tells you what went
 * wrong without extra digging.
 *
 * Usage:  await expect(response).toHaveApiStatus(200);
 */
export const expect = baseExpect.extend({
  async toHaveApiStatus(response: APIResponse, expectedStatus: number) {
    const actualStatus = response.status();
    if (actualStatus === expectedStatus) {
      return { pass: true, message: () => '' };
    }
    const endpoint = new URL(response.url()).pathname;
    const rawBody = (await response.text()).trim();
    let body = rawBody;
    try {
      body = JSON.stringify(JSON.parse(rawBody), (key, value) =>
        key === 'notes' ? '<redacted>' : value,
      );
    } catch {
      // Non-JSON error bodies are safe to show as a short diagnostic excerpt.
    }
    body = body.slice(0, 400) || '<empty response>';
    return {
      pass: false,
      message: () =>
        `API ${endpoint}\n` +
        `  Expected status: ${expectedStatus}\n` +
        `  Received status: ${actualStatus}\n` +
        `  Response body: ${body}`,
    };
  },
});

/**
 * The `api` fixture is an authenticated-style request context pointed at the
 * Reminders API base URL. For this exercise there is no real auth, so it is a
 * plain request context. In the real TC2 suite this is where per-user auth
 * state is attached.
 */
export const test = base;
