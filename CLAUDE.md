# Fidelity Health (with Missie)

**Fidelity Health** is the app: a fictional medical-records platform that partners with hospitals to track, store and protect patients' medical record history. **Missie** is its context-aware (RAG) AI assistant, under `/missie`. Missie helps users with record history, access and sharing, partner hospitals and data protection; it does not interpret records or give medical advice. Learning project from the _AI Course for Developers_. See README.md for the product overview and setup.

## Layout

Bun workspace:

- `packages/client`: React 19 + Vite + Tailwind 4 + Redux Toolkit + React Router (data-router mode). See its README for the folder structure and state patterns.
- `packages/server`: Express 5 + TypeScript + Zod + Prisma (PostgreSQL). Domain folders live under `src/domains/<domain>/` (router, controllers, lib/services, schema).

## Conventions

- Use Bun for installs and scripts (`bun install`, `bun run <script>`, `bunx`). The stack itself is Vite on the client and Express on the server; don't swap these for `Bun.serve` or Bun's bundler.
- Client:
  - **Imports:** use the `@/` alias for `src/`.
  - **Components:** page-only components live in their route folder; `src/components` is for shared ones only.
  - **Icons:** Heroicons v2 (`react-icons/hi2`).
  - **Colours:** One teal for the whole app, used at different strengths: solid `accent` for primary actions only, faded `accent-soft`/`muted`/`hover` tints for highlights, `accent-ink` for text on tints. Missie has its own tokens that currently point at the same teal (`missie`, `missie-soft`, `missie-ink`). Defined in `src/styles/globals.css`; don't hard-code hex values.
  - **Account types:** `patient` or `hospital` (`selectAccountType` in authSlice). Hospitals upload records for registered patients; patients view only.
  - **Routing:** register every page in `src/router.tsx`. Folders under `src/routes` don't create routes by themselves.
  - **State:** use the typed `useAppDispatch` / `useAppSelector` hooks. API calls are `createAsyncThunk`s in `src/rtk-base/slices`, going through `src/utils/axiosBase.ts`.
- Server:
  - **Responses** use `{ responseMessage, response, error }`.
  - **Validation** uses Zod schemas through `validateData`.
  - **One function per file** for controllers and lib services (e.g. `missie.startTurn.service.ts`). Shared constants and helpers go in `src/utils/<domain>/`. WebSocket controllers may stay in a single file.
- **Prisma:** commands need `.env.development` loaded, e.g. `bunx dotenv -e .env.development -- bunx prisma migrate deploy` (run in `packages/server`).

## Checks

Static checks only unless asked otherwise:

- **Client:** `bun run build` (includes `tsc -b`). ESLint is currently broken by TypeScript 7.
- **Server:** `bunx tsc --noEmit`.

## Content

Missie is not a medical service. Any UI copy or legal text must:

- keep the demo/fictional notice;
- avoid presenting output as medical advice or record interpretation;
- describe record access as opt-in and confirmation-gated.

The legal pages live in `packages/client/src/routes/legal`; update them, and `LEGAL_LAST_UPDATED` in `documents.ts`, when data handling changes.
