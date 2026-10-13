# TrendConnect Test Automation Take-Home

Welcome, and thanks for taking the time. This repo contains a small **Reminders API** and a test skeleton. Your job is to test it: write API tests, hunt for bugs and guard against them, and run a quick load check.

Everything runs locally. No accounts, no VPN, no external services.

> The full exercise description (the three parts, weighting, and how we evaluate) is in the brief we emailed you. This README is just how to run things.

## Prerequisites

- **Node.js** 20 or newer
- **k6** for Part C only. Install: https://grafana.com/docs/k6/latest/set-up/install-k6/

## Setup

```bash
npm install
npx playwright install chromium
```

## Run the API

```bash
npm run api
```

The API listens on `http://localhost:3000` and resets its data every time it starts. See [`API_REFERENCE.md`](./API_REFERENCE.md) for the contract.

You do **not** need to modify anything in `api/`. Treat it as a black box and test it over HTTP.

## Run the tests

```bash
npm test              # runs all Playwright tests (auto-starts the API)
npm run test:smoke    # runs only @Healthcheck tests
```

Playwright is configured to start the API for you, so `npm test` works on its own. If you prefer, run `npm run api` in one terminal and the tests in another.

## Run the load scenario (Part C)

```bash
npm run api           # terminal 1
npm run k6:build      # bundle the TypeScript scenarios into load/dist/
npm run k6:smoke      # terminal 2: runs load/dist/reminders-smoke.js
```

## Where things live

```
api/                         The Reminders API (do not modify)
  server.js
  seed.js
tests/
  fixtures/
    api.fixture.ts           test fixture + toHaveApiStatus matcher
  api/reminders/
    Reminders_API.ts         example endpoint wrapper
    Reminders_Schema.ts      example Zod schemas
    Reminders_List.spec.ts   example spec (start here)
load/
  esbuild.config.mjs         bundles scenarios for k6
  profiles/smoke.ts          load profile
  shared/http.ts             base URL helper
  scenarios/reminders-smoke.ts   example k6 scenario (start here)
API_REFERENCE.md             the API contract
```

## What to put in your submission

Please update this README (or add a `NOTES.md`) with:

- **Bugs you found** — a short repro for each (endpoint, input, expected vs. actual).
- **Load results** — a couple of sentences reading your k6 run.
- **What you'd do next** with more time.

If you ran out of time on anything, just say so. That's good judgment, not a gap.

Good luck.
