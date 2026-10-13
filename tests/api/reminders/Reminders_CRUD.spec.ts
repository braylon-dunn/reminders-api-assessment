import { test, expect } from '@fixtures/api.fixture';
import { RemindersApi, ReminderInput } from './Reminders_API';
import {
  ErrorSchema,
  ReminderSchema,
  ValidationErrorSchema,
} from './Reminders_Schema';

const validReminder = (): ReminderInput => ({
  patientName: 'API Test Patient',
  title: 'Follow-up call',
  dueDate: '2027-02-01T12:00:00.000Z',
});

test.describe('Reminder CRUD', () => {
  test('health endpoint is ready @Healthcheck', async ({ request }) => {
    const response = await request.get('/health');
    await expect(response).toHaveApiStatus(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  test('gets a seeded reminder by id @ReadOnly', async ({ request }) => {
    const response = await new RemindersApi(request).getById('r-001');
    await expect(response).toHaveApiStatus(200);

    const body = ReminderSchema.parse(await response.json());
    expect(body).toMatchObject({ id: 'r-001', status: 'Open', title: 'Reminder 1' });
  });

  test('returns a JSON 404 for an unknown reminder @ReadOnly', async ({ request }) => {
    const response = await new RemindersApi(request).getById('does-not-exist');
    await expect(response).toHaveApiStatus(404);
    ErrorSchema.parse(await response.json());
  });

  test('creates a reminder and applies defaults', async ({ request }) => {
    const api = new RemindersApi(request);
    const response = await api.create(validReminder());
    await expect(response).toHaveApiStatus(201);

    const created = ReminderSchema.parse(await response.json());
    expect(created).toMatchObject({
      patientName: 'API Test Patient',
      title: 'Follow-up call',
      notes: '',
      dueDate: '2027-02-01T12:00:00.000Z',
      status: 'Open',
    });

    const getResponse = await api.getById(created.id);
    await expect(getResponse).toHaveApiStatus(200);
    expect(ReminderSchema.parse(await getResponse.json())).toEqual(created);
  });

  for (const example of [
    { name: 'missing patientName', body: { ...validReminder(), patientName: undefined } },
    { name: 'blank patientName', body: { ...validReminder(), patientName: '   ' } },
    { name: 'missing title', body: { ...validReminder(), title: undefined } },
    { name: 'invalid status', body: { ...validReminder(), status: 'Pending' } },
    { name: 'invalid date', body: { ...validReminder(), dueDate: 'not-a-date' } },
  ]) {
    test(`rejects ${example.name}`, async ({ request }) => {
      const response = await new RemindersApi(request).create(example.body);
      await expect(response).toHaveApiStatus(400);
      ValidationErrorSchema.parse(await response.json());
    });
  }

  for (const { name, ...invalidFields } of [
    { name: 'blank title', title: '' },
    { name: 'whitespace-only title', title: '   ' },
    { name: 'non-string title', title: 42 },
    { name: 'impossible calendar date', title: 'Valid title', dueDate: '2026-02-30T12:00:00.000Z' },
  ]) {
    test(`rejects ${name}`, async ({ request }) => {
      test.fail(true, 'Known defect: create validation accepts this contract-invalid value');
      const response = await new RemindersApi(request).create({ ...validReminder(), ...invalidFields });
      await expect(response).toHaveApiStatus(400);
      ValidationErrorSchema.parse(await response.json());
    });
  }

  test('completes an existing reminder', async ({ request }) => {
    const api = new RemindersApi(request);
    const createResponse = await api.create(validReminder());
    const created = ReminderSchema.parse(await createResponse.json());

    const response = await api.complete(created.id);
    await expect(response).toHaveApiStatus(200);
    expect(ReminderSchema.parse(await response.json())).toMatchObject({
      id: created.id,
      status: 'Done',
    });
  });

  test('returns 404 when completing an unknown reminder', async ({ request }) => {
    test.fail(true, 'Known defect: complete returns 200 with an empty object for an unknown id');
    const response = await new RemindersApi(request).complete('does-not-exist');
    await expect(response).toHaveApiStatus(404);
    ErrorSchema.parse(await response.json());
  });
});
