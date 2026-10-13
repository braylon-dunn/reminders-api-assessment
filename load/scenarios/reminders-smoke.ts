import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { smoke } from '../profiles/smoke';
import { url } from '../shared/http';

/**
 * Example k6 scenario against the Reminders API.
 *
 * This is a minimal starting point: it lists reminders and checks the status.
 * For Part C, build this into a realistic journey (for example: search, page
 * through results, then fetch a detail), add a custom metric, and set a couple
 * of thresholds (for example a p95 response-time budget and an error ceiling).
 *
 * Run:
 *   npm run api        # in one terminal
 *   npm run k6:build   # bundle scenarios to load/dist/
 *   npm run k6:smoke   # runs load/dist/reminders-smoke.js
 */
export const options = {
  vus: smoke.vus,
  duration: smoke.duration,
  thresholds: {
    http_req_duration: ['p(95)<250'],
    http_req_failed: ['rate<0.01'],
    journey_failed: ['rate<0.01'],
    detail_duration: ['p(95)<200'],
  },
};

const journeyFailed = new Rate('journey_failed');
const detailDuration = new Trend('detail_duration', true);

export default function () {
  let journeyOk = true;

  group('browse open reminders', () => {
    const list = http.get(url('/reminders?status=Open&sort=dueDate&order=asc&page=1&pageSize=5'), {
      tags: { endpoint: 'list' },
    });
    const listOk = check(list, {
      'list status is 200': (r) => r.status === 200,
      'list returns items': (r) => Array.isArray(r.json('items')) && (r.json('items') as unknown[]).length > 0,
    });
    journeyOk = journeyOk && listOk;

    if (!listOk) return;
    const firstId = list.json('items.0.id') as string;
    const detail = http.get(url(`/reminders/${encodeURIComponent(firstId)}`), {
      tags: { endpoint: 'detail' },
    });
    detailDuration.add(detail.timings.duration);
    const detailOk = check(detail, {
      'detail status is 200': (r) => r.status === 200,
      'detail id matches selection': (r) => r.json('id') === firstId,
    });
    journeyOk = journeyOk && detailOk;
  });

  journeyFailed.add(!journeyOk);
  sleep(0.5);
}
