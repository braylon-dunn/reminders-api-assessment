import { test, expect } from '@fixtures/api.fixture';
import { RemindersApi } from './Reminders_API';
import { ReminderListSchema } from './Reminders_Schema';

/**
 * Example spec. This is here to show the patterns we use: a wrapper class, a
 * custom status matcher, and schema validation. It is deliberately minimal.
 *
 * Build your own coverage out from here. Every spec file should have at least
 * one @Healthcheck test.
 */
test.describe('Reminders list @ReadOnly', () => {
  test('returns 200 and a well-formed list @Healthcheck', async ({ request }) => {
    const api = new RemindersApi(request);

    const response = await api.list({ page: 1, pageSize: 5 });
    await expect(response).toHaveApiStatus(200);

    const body = await response.json();
    // Validate the response shape, not just the status.
    ReminderListSchema.parse(body);
    expect(body.items.length).toBeGreaterThan(0);
  });

  test('uses documented defaults and returns the full matching total', async ({ request }) => {
    test.fail(true, 'Known defect: total contains only the current page item count');
    const response = await new RemindersApi(request).list();
    await expect(response).toHaveApiStatus(200);

    const body = ReminderListSchema.parse(await response.json());
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);
    expect(body.items).toHaveLength(10);
    expect(body.total).toBe(25);
    expect(body.items.map((item) => item.id)).toEqual([
      'r-001', 'r-002', 'r-003', 'r-004', 'r-005',
      'r-006', 'r-007', 'r-008', 'r-009', 'r-010',
    ]);
  });

  test('reports filtered total across pages', async ({ request }) => {
    test.fail(true, 'Known defect: total contains only the current page item count');
    const response = await new RemindersApi(request).list({ status: 'Open', page: 2, pageSize: 7 });
    await expect(response).toHaveApiStatus(200);

    const body = ReminderListSchema.parse(await response.json());
    expect(body.items).toHaveLength(7);
    expect(body.total).toBe(20);
  });

  test('sorts due dates descending', async ({ request }) => {
    test.fail(true, 'Known defect: descending order is accepted but ignored');
    const response = await new RemindersApi(request).list({ sort: 'dueDate', order: 'desc', pageSize: 25 });
    await expect(response).toHaveApiStatus(200);

    const body = ReminderListSchema.parse(await response.json());
    const dueDates = body.items.map((item) => item.dueDate);
    expect(dueDates).toEqual([...dueDates].sort().reverse());
  });

  test('returns an empty page beyond the result set without changing total', async ({ request }) => {
    test.fail(true, 'Known defect: total contains only the current page item count');
    const response = await new RemindersApi(request).list({ page: 99, pageSize: 10 });
    await expect(response).toHaveApiStatus(200);

    const body = ReminderListSchema.parse(await response.json());
    expect(body.items).toEqual([]);
    expect(body.total).toBe(25);
  });
});
