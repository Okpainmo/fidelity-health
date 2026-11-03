# Fidelity Health

**Fidelity Health** is a mock medical-records platform. It partners with hospitals to track, store and protect patients' medical record history. Hospital records officers upload records, and patients see their complete history in one place.

**Missie** is Fidelity Health's AI assistant. It answers questions about record history, access and sharing, partner hospitals and data protection, using Fidelity Health's own guides and policies through retrieval-augmented generation (RAG). It is planned to grow into an agentic assistant that can take simple actions on a user's behalf.

> **Demo project.** Fidelity Health and its partner hospitals are fictional, and this is a learning build from the _AI Course for Developers_. Neither the app nor Missie interprets medical records or give medical advice, and nothing here should be used for real health decisions. Don't enter real medical data.

## Status

| Area                         | State                                                                   |
| ---------------------------- | ----------------------------------------------------------------------- |
| Accounts (sign up, log in)   | Working, against the server's auth endpoints                            |
| Account types                | Working: patient and institution (hospital) accounts, stored on the server as `accountType` |
| Profiles (patient and institution) | Working: stored on the server and saved from the profile pages |
| Medical records              | Working: verified hospitals find registered patients and upload records with attachments (S3); the hospital verifies or rejects each one; patients see theirs |
| Profile photos               | Working: patients' passport photos, stored in S3 |
| Admin dashboard              | Working: `/admin` for Fidelity Health staff, covering an overview, institution verification, user accounts and all records |
| Chat interface               | Working: conversations are saved on the server, and replies stream in   |
| AI responses                 | Working: an OpenAI-compatible model (Amazon Bedrock); no knowledge base yet |
| RAG (knowledge base, search) | Not built yet                                                           |
| Agentic actions (tools)      | Not built yet                                                           |
| About and legal pages        | Done: about page with FAQ; drafts of the privacy policy, terms, medical disclaimer, AI use and cookie pages |

## How Missie is meant to work

1. A signed-in user asks a question in the chat.
2. The server searches Fidelity Health's knowledge base (platform guides, policies and FAQs) for the most relevant passages.
3. Those passages are given to the language model together with the question.
4. The model answers from that context and points to the sources it used. When the knowledge base doesn't cover a question, Missie says so instead of guessing.
5. Later, Missie can act as an agent and call tools, such as requesting a copy of records, showing who has accessed them, or starting a change to sharing settings. It always asks the user to confirm first.
6. Any access to a user's own records will be opt-in, limited to that user's records, and never shared across users.

## Repository layout

This is a [Bun workspace](https://bun.com/docs/install/workspaces) with two packages:

```
packages/
  client/   React + Vite web app (home, records, upload, Missie chat, auth, about and legal pages)
  server/   Express + TypeScript API (auth, users, admin, Missie chat; RAG to come)
```

- [packages/client/README.md](packages/client/README.md): client structure, state management and routes.
- [packages/server/README.md](packages/server/README.md): API endpoints, environment and database setup.

## Tech stack

- **Client:** React 19, Vite, Tailwind CSS 4, Redux Toolkit, React Router, Axios.
- **Server:** Node.js, Express 5, TypeScript, Zod, Prisma (PostgreSQL), JWT sessions with an http-only cookie, a built-in WebSocket server.
- **Tooling:** Bun (package manager and workspaces).

## Getting started

### Prerequisites

- [Bun](https://bun.com)
- Node.js (the server's dev script uses `tsx`)
- PostgreSQL. The development settings expect it on `localhost:5433`.

### 1. Install dependencies

From the repository root:

```bash
bun install
```

### 2. Configure the server

The server reads `packages/server/.env` to pick the environment, then the matching file (for example `.env.development`). Copy the sample if you don't have one yet:

```bash
cp packages/server/.env.development.sample packages/server/.env.development
```

Set `POSTGRES_DATABASE_URL`, `JWT_SECRET` and the `DATABASE_TYPE_*` values. See the server README for every variable.

### 3. Run database migrations

From `packages/server`:

```bash
bunx dotenv -e .env.development -- bunx prisma migrate deploy
```

### 4. Start the server

```bash
cd packages/server
bun run dev
```

The API runs on `http://localhost:5000` (from `PORT`), under `/api/v1`.

### 5. Start the client

```bash
cd packages/client
bun run dev
```

Open `http://localhost:5173`. The server only accepts browser requests from port 5173 in development (see `allowedOrigins` in `packages/server/src/app.ts`).

The client reads the API address from `VITE_API_URL_BASE` in `packages/client/.env.development`.

## Pages

| Path                       | Access     | Purpose                         |
| -------------------------- | ---------- | ------------------------------- |
| `/login`                   | Signed out | Log in (patients and institutions) |
| `/signup`                  | Signed out | Patient sign-up                 |
| `/signup/hospital`         | Signed out | Hospital / institution sign-up  |
| `/`                        | Signed in  | Home; actions differ by account type |
| `/records`                 | Signed in  | Patients: My records. Institutions: Patient records |
| `/records/upload`          | Verified institutions | Upload a record for a registered patient |
| `/records/:id`             | The record's patient or hospital, admins | Record detail with attachments; the hospital verifies or rejects it here |
| `/admin` and sub-pages     | Admins     | Overview, institutions (verification), users, all records |
| `/profile`                 | Signed in  | My profile (patient) or Institution profile |
| `/missie/chat`, `/missie/chat/:id` | Signed in | Chat with Missie (old `/chat` links redirect) |
| `/settings`                | Signed in  | Account details and log out     |
| `/about`                   | Public     | About Fidelity Health and Missie |
| `/legal` and its sub-pages | Public     | Privacy, terms and other notices |
