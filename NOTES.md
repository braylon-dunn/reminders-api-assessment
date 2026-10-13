# Assessment notes

## Approach

I focused on contract behavior that affects clients: response shape, pagination and sorting, create validation, retrieval, and completion. Tests use the supplied endpoint wrapper and Zod schemas. Known defects use Playwright's `test.fail` annotation: they are visible as expected failures today and become unexpected-pass failures when the service behavior changes, prompting removal of the annotation.

The suite is safe to run fully parallel. Tests that mutate state create their own reminder and never depend on a particular generated ID. The custom status matcher also redacts `notes` before including response JSON in failure output.

## Bugs found

1. **List total reports page length, not matching result count.** `GET /reminders?page=1&pageSize=10` returns `total: 10`; expected `25`. `GET /reminders?status=Open&page=2&pageSize=7` returns `total: 7`; expected `20`. An out-of-range page returns `total: 0`; expected `25`.
2. **Descending sort is ignored.** `GET /reminders?sort=dueDate&order=desc&pageSize=25` returns dates in ascending order; expected descending order.
3. **Invalid titles are accepted.** `POST /reminders` with `title` equal to `""`, whitespace only, or a number returns `201`; expected `400` with an `errors` array because title must be a non-empty string.
4. **Impossible calendar dates are accepted.** `POST /reminders` with `dueDate: "2026-02-30T12:00:00.000Z"` returns `201` and silently normalizes the date to March 2; expected `400` because the supplied date is invalid.
5. **Completing an unknown reminder returns success.** `POST /reminders/does-not-exist/complete` returns `200` with `{}`; expected `404` with a JSON error body.

## Load result

On October 13, 2026, the local two-VU, 30-second smoke run completed 120 browse-and-detail journeys (240 HTTP requests) with no failed checks, HTTP requests, or journeys. Overall latency was 3.73 ms average and 4.51 ms p95; detail latency was 3.53 ms average and 4.36 ms p95. All configured thresholds passed. This is a local smoke baseline, not evidence of production capacity.

## What I would do next

- Clarify and test the intended policy for invalid list query values, unknown request fields, content types, and malformed JSON.
- Add boundary and property-based cases for page/pageSize and ISO timestamps, including maximum sizes and time-zone offsets.
- Add a CI workflow and isolated service state per worker if the suite grows more mutation-heavy.
- After establishing service-level objectives and representative traffic, add staged load, stress, and soak profiles rather than extrapolating from this smoke run.
