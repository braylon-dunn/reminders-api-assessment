import { z } from 'zod';

/**
 * Example schema for a single reminder.
 *
 * We validate the *shape and types* of responses, not just the status code.
 * This is a starting point. Tighten it, or add schemas for the list response
 * and error responses, as you build out coverage.
 */
export const ReminderSchema = z.object({
  id: z.string().regex(/^r-\d{3,}$/),
  patientName: z.string().min(1),
  title: z.string().min(1),
  notes: z.string(),
  dueDate: z.string().datetime(),
  status: z.enum(['Open', 'Done']),
  createdAt: z.string().datetime(),
}).strict();

export type Reminder = z.infer<typeof ReminderSchema>;

export const ReminderListSchema = z.object({
  items: z.array(ReminderSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
}).strict();

export const ErrorSchema = z.object({
  error: z.string().min(1),
}).strict();

export const ValidationErrorSchema = z.object({
  errors: z.array(z.string().min(1)).min(1),
}).strict();
