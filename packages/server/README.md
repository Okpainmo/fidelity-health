# Missie: server

The API for Missie, the context-aware (RAG) platform assistant for Fidelity Health, a fictional institution that partners with hospitals to track, store and protect patients' medical records. See the [root README](../../README.md) for the full picture and how to run everything.

> Demo project: Fidelity Health is not a real organisation, and nothing here is medical advice.

## Missie-specific notes

### Current endpoints

All routes are under `/api/v1`.

| Method | Path                              | Access | Purpose                       |
| ------ | --------------------------------- | ------ | ----------------------------- |
| POST   | `/auth/register`                  | Public | Create an account and start a session. Body: `name`, `email`, `password`, optional `accountType` (`patient` default, or `hospital`) |
| POST   | `/auth/log-in`                    | Public | Log in and start a session    |
| GET    | `/user/me/profile`                | Session | Get your own patient or hospital profile (created empty if missing) |
| PATCH  | `/user/me/profile`                | Session | Update your own profile. Body is validated per account type (`src/domains/user/schema/profile.schema.ts`); send only changed fields, `''` clears a field |
| PUT    | `/user/me/profile/photo`          | Patients | Upload a passport photo (multipart field `photo`: JPG, PNG or WebP, up to 5 MB). Replaces any existing one |
| DELETE | `/user/me/profile/photo`          | Patients | Remove the passport photo |
| GET    | `/records/patients/search?q=`     | Verified hospitals | Find registered patients by name, Fidelity Health ID or phone (2+ characters, up to 10 results) |
| POST   | `/records`                        | Verified hospitals | Upload a record. Multipart: `data` (JSON, see `src/domains/records/schema/records.schema.ts`) and `files` (1–10; PDF, JPG, PNG, DICOM or Word, up to 25 MB each). `data.attachments[i].category` describes `files[i]` |
| GET    | `/records`                        | Session | Patients: their own verified and pending records. Hospitals: everything they submitted |
| GET    | `/records/:recordId`              | Record's patient, hospital, or admins | Full record with short-lived file links (`url` to open, `downloadUrl` to download) |
| PATCH  | `/records/:recordId/review`       | Submitting hospital | `{ status: 'verified' \| 'rejected', note? }` |
| GET    | `/user/:userId`                   | Session | Get a user profile           |
| GET    | `/user`                           | Session | List user profiles           |
| GET    | `/admin/overview`                 | Admins | Counts of accounts, institutions and records; institutions awaiting verification; latest records |
| GET    | `/admin/hospitals?status=&q=`     | Admins | Institutions, filterable by verification status |
| GET    | `/admin/hospitals/:userId`        | Admins | One institution's full profile |
| PATCH  | `/admin/hospitals/:userId/verification` | Admins | `{ status: 'pending' \| 'verified' \| 'rejected', note? }` |
| GET    | `/admin/users?type=&status=&q=`   | Admins | All accounts (`type`: patient, hospital, admin; `status`: active, inactive) |
| GET    | `/admin/users/:userId`            | Admins | One account with its profile |
| PATCH  | `/admin/users/:userId/status`     | Admins | `{ isActive }`. Admins can't deactivate themselves |
| GET    | `/admin/records?status=&q=`       | Admins | Every record (latest 200 matching) |
| PATCH  | `/admin/deactivate-user/:userId`  | Admins | Older endpoint; prefer `/admin/users/:userId/status` |
| POST   | `/missie/chat`                    | Session | Send Missie a message and get the full reply. Body: `message`, optional `conversationId` (leave out to start a new conversation) |
| WS     | `/missie/chat/stream`             | Session (see below) | Same as `/missie/chat`, with the reply streamed as it's generated. Used by the client |
| GET    | `/missie/conversations`           | Session | Your conversations, most recent first |
| GET    | `/missie/conversations/:conversationId` | Session | One conversation with its messages |
| PATCH  | `/missie/conversations/:conversationId` | Session | Rename a conversation. Body: `title` (1–120 characters). Doesn't change its place in the list |
| DELETE | `/missie/conversations/:conversationId` | Session | Delete a conversation |

All `/admin` routes go through `adminRoutesProtectorMiddleware`. Deactivated accounts can't log in, and their existing sessions get a 401.

Responses use the envelope `{ responseMessage, response, error }`. Protected routes need the `Authorization: Bearer <accessToken>` and `email` headers plus the auth cookie set at log-in.

### Missie chat

- **Conversations:** stored per user in `MissieConversation` and `MissieMessage`. The model sees the latest 20 messages of a conversation. A `conversationId` that isn't the caller's returns 404.
- **Model:** any OpenAI-compatible endpoint (e.g. Amazon Bedrock), set with `OPENAI_API_KEY`, `OPENAI_BASE_URL` and `MISSIE_MODEL` (e.g. `openai.gpt-oss-120b`). All three are required.
- **No RAG yet:** Missie answers from its system prompt only (`src/utils/missie/missie.prompt.ts`).
- **Streaming (`ws://<host>/api/v1/missie/chat/stream`):** browsers can't set headers on a WebSocket, so the auth cookie goes with the handshake and the first message carries the rest:
  1. send `{ "type": "auth", "payload": { "email", "accessToken" } }` within 10 seconds and wait for `auth.ok`;
  2. send `{ "type": "chat", "payload": { "message", "conversationId?" } }`;
  3. receive `chat.start`, then `chat.delta` chunks, then `chat.done` with the saved reply.

  Send `chat.cancel` to stop a reply (the partial reply is kept). Errors arrive as `{ "type": "error", "payload": { "code", "message" } }`. The socket closes with `4401` on failed auth and `4403` on an expired session. The full protocol is at the top of `src/domains/missie/controllers/missie.chatStream.controller.ts`.

### Planned

- **RAG:**
  - load Fidelity Health's platform guides, policies and FAQs, split them into chunks, embed them and store them for search;
  - fetch the most relevant chunks for each question and send them to the model;
  - return the sources used with each answer.
- **Conversations:** renaming.
- **Tools:** agentic actions with user confirmation, such as requesting a copy of records, showing who has accessed them, or changing sharing settings.
- **Record access:** any access to a user's own records must be opt-in, limited to that user's records, and checked on the server.

### Medical records

- **Who uploads:** only hospitals whose institution an admin has verified can search patients or upload records. A record belongs to a registered patient (found by Fidelity Health ID).
- **Review:** records start `pending`. The submitting hospital verifies or rejects them on the record page.
- **Visibility:** patients see their own verified and pending records (when `visibleToPatient` is true), never rejected ones. Hospitals see what they submitted. Admins see everything.
- **Models:** `MedicalRecord` (reference shown as `FHR-000123`) and `RecordAttachment` in `prisma/schema.prisma`.

### File storage (S3)

Set up the same way as XOps Maestros: two buckets, each with its own credentials, configured in the environment file:

```bash
AWS_IMAGES_ENABLED=true            # profile photos
AWS_IMAGES_ACCESS_KEY=...
AWS_IMAGES_SECRET_ACCESS_KEY=...
AWS_IMAGES_S3_BUCKET_REGION=eu-north-1
AWS_IMAGES_S3_BUCKET_NAME=...

AWS_FILES_ENABLED=true             # record attachments
AWS_FILES_ACCESS_KEY=...
# ...same fields
```

- **Keep both buckets private.** Unlike XOps Maestros, the API never stores or returns public URLs: it keeps each object's key and hands out signed URLs that expire (10 minutes for attachments, 1 hour for photos), only after checking the caller may see the file.
- **IAM permissions:** each key needs `s3:PutObject`, `s3:GetObject` and `s3:DeleteObject` on its bucket.
- **If a bucket isn't configured:** the server still starts; uploads to it return 503 "file storage isn't configured".
- **Code:** `src/utils/storage/s3.ts` (S3 calls) and `src/utils/storage/uploads.ts` (multipart limits and file types).

### Admins

There's deliberately no API for making admins. Sign up normally, then run (from `packages/server`):

```bash
bun run admin:make person@example.com
```

Log out and back in to see "Admin dashboard" in the account menu (`/admin` in the client).

### Accounts and profiles

- **Account type:** every user has an `accountType` of `patient` or `hospital`, set at `/auth/register`.
- **Profiles:** each account also gets a matching profile row at sign-up, in the same transaction.
  - `PatientProfile`: personal details, contact, next of kin, insurance, health profile, allergies and medications. Has a Fidelity Health ID, `fhId`.
  - `HospitalProfile`: institution and licence details, location, services, records and data-protection contacts. Has an `institutionId` and a `verificationStatus`.
- **Older accounts:** accounts created before profiles existed get theirs on first `GET /user/me/profile`.
- **Chat mode:** both profile types have `chatMode`, `direct` or `stream-response` (default), saved through `PATCH /user/me/profile`. The client uses it to pick `POST /missie/chat` or the streaming WebSocket.
- **Keeping names in step:** saving a patient's first/last name or a hospital's `institutionName` also updates the account's `name`.

### Database

This build uses **PostgreSQL** (through Prisma) as its only database; MongoDB support has been removed. Development expects Postgres on `localhost:5433`.

Run migrations from this folder (the database URL lives in `.env.development`):

```bash
bunx dotenv -e .env.development -- bunx prisma migrate deploy
```

### CORS

In development the API accepts browser requests from `http://localhost:5173`, `http://127.0.0.1:5173` and `http://localhost:3000` only (`allowedOrigins` in `src/app.ts`).

---

## Template reference

Everything below comes from the server template this package was built from.

> **MongoDB has been removed from this project.** PostgreSQL (Prisma) is the only database. Template notes about MongoDB, Mongoose and the `DATABASE_TYPE` settings have been removed below.

This template, is a dedicated web-socket version of the [multi-db-nodejs-express-with-typescript-and-zod-template](https://github.com/Okpainmo/multi-db-nodejs-express-with-typescript-and-zod-template) - a highly flexible, function-based, domain-driven-development(DDD)-inspired NodeJs/Express(with Typescript) template.

> **Before you generate a project with the template, endeavour to check the ["How To Use This Template"](https://github.com/Okpainmo/ws__multi-db-nodejs-express-with-typescript-and-zod-template?tab=readme-ov-file#how-to-use-this-template) section of this README file**.

> **The [Debugging](https://github.com/Okpainmo/multi-db-nodejs-express-with-typescript-and-zod-template?tab=readme-ov-file#debugging) section will also be helpful in case you run into some tricky errors.**

## Features.

> In a way, it honestly feels like a crime to me, for anyone to still go about building systems with plain-ole vanilla Javascript. This template is **fully typed 💪**.
>
> Furthermore, is serves perfectly as a **great option for anyone who already understands Express, and do not intend to switch to a new NodeJs framework like NestJS**.

- The template is set up to utilize a centralized, Zod-validated configuration system that uses PostgreSQL (via Prisma) and supports multiple working environments.

- Inside, you'll find professionally crafted implementations that show how to practically build and ship top-class Node/Express APIs that are fully typed.

- It also comes with a standard WebSocket implementation(using the `ws` NodeJs library), to enable real-time communication between the client and the server.

> **I created this with so much love(❤️) for myself, and engineering teams I lead/work on.**
>
> Feel free to bet you life on it.

Below is a more detailed list of the core features of this template.

1. **Modular & Scalable Configuration**: A centralized, Zod-powered configuration system that validates your entire environment on startup. Configuration is split into specialized modules (`db`, `jwt`, `server`, `ws`).

2. **High-Security Auth Middleware**: A robust, dual-layered security architecture that separates Access and Session management. Includes pre-configured JWT handling and high-security HTTP-only cookie deployment for production-grade authentication.

3. **Integrated WebSocket Core**: A professional WebSocket server implementation (using `ws`) included out of the box. Features built-in include: heartbeats, auto-cleanup, and graceful shutdown to ensure real-time stability and a lot more.

4. **Domain-Driven Design (DDD)**: A clean, modular architecture inspired by DDD. All database-related business logic are strictly separated from API routing and controllers, making the codebase a joy to tweak, navigate, and scale - as might be necessary in the future.

5. **Multi-Environment Harmony**: Seamless support for `development`, `staging`, and `production`. Test complex environment-specific configurations locally with ease using isolated `.env` stacks.

6. **Elite Developer Experience**:
   - **Full TypeScript**: End-to-end type safety for rock-solid code.
   - **Automated Quality**: Husky, Lint-staged, and Commitlint are pre-configured to enforce formatting, linting, and commit standards.
   - **Modern Stack**: Powered by **Bun** for lightning-fast package management and execution.

7. **Deployment Ready**: Standardized `Dockerfile` and `docker-compose` templates included, ensuring your app is ready for the cloud from day one.

> Package manager is **`Bun`**.

### High Professional And Beautifully Implemented.

As earlier stated, the template is DDD(domain driven development)-inspired. Hence, it comes with some default - carefully thought-out domains(`auth`, `user`, and `admin`).

With these default domains, you'll get to see how sample end-points are neatly and professionally implemented, providing COMPLETE extraction of ALL DATABASE LOGIC into unified service files.

### One Process, One File

The template utilizes a "One Process, One File" pattern for database operations (e.g., `user.findUser.service.ts`). Each service file holds the Prisma (PostgreSQL) logic for one operation, keeping database code out of controllers and routers.

## Working Environment Support.

> As per working environments, the template supports 3 different environments(development/dev, staging, and production/prod).
>
> **This gives you the massive flexibility of being able to test any of the working environments locally with so much ease.**

### Environment Variables

> The project has 4(four) environmental variable files - with each currently created as samples. **Ensure to remove the `.sample` suffixes/extensions immediately you clone your newly bootstrapped project.**
>
> 1. `.env` - the CORE/CENTRAL environment variable file that helps with selecting your preferred working environment.
> 2. `.env.development` - environmental variables file for the dev/development environment.
> 3. `.env.staging` - environmental variables file for the staging environment.
> 4. `.env.production` - environmental variables file for the prod/production environment.

> Switching to a different environment is easy: **simply head to the CORE environment file(`.env`), and select your preferred environment by uncommenting it and commenting the others**.
>
> The project uses a dedicated config loader (`src/config/utils/envInit.ts`) that automatically detects this change and loads the corresponding `.env.{environment}` file.

I.e.

```bash
# ...code before

# =========================================================================================================
# The template comes with 4 '.env' files. The main one(`.env) is a core/central environment selection file. All
# it does is to help you select your preferred working environment from one of 'development', 'staging', and 'production'.
#
# All the others are for the three main environments(development, staging, and production) that is assumed you'll
# be working from. This gives you the flexibility to test any of the environments locally with much ease.
#
# Simply un-comment the line for your preferred working/testing environment, and you'll be right on it.
#
# The project has been pre-configured(see `src -> app.ts`) to select one from the 3 .env files based on the
# environment you un-comment below. By default, the 'development' environment is un-commented/selected.
#
# BELOW: UN-COMMENT YOUR PREFERRED ENVIRONMENT, AND THE PROJECT WILL SELECT/USE THE CORRESPONDING .env FILE
# ==========================================================================================================

NODE_ENV="development"
# NODE_ENV="production"
# NODE_ENV="staging"

# ...code after
```

## How To Use This Template.

1. Using this template is simple. The main criteria being that you know how to use typescript, and that you have Docker installed on your machine.

2. Create/Bootstrap a project repository(using this as a template).

3. Now clone your project, and settle in to start .

```bash
git clone your-project-url

cd your-project-name
```

4. Remove the `.sample` suffixes/extensions from all the environmental variables files in your newly clone project.

5. Proceed to install all dependencies and dev-dependencies.

**with current project versions**:

```bash
npm install
```

**or, with new version installations(ensure to delete the `package.json` and `package-lock.json` files first)**:

```bash
# dependencies
npm install axios bcryptjs cookie-parser cors dayjs dotenv express nodemailer pino zod @prisma/client bcrypt jsonwebtoken @prisma/adapter-pg pg ws

# dev-dependencies
npm install @types/cookie-parser @types/cors @types/express @types/node @types/nodemailer @typescript-eslint/parser prisma eslint eslint-config-prettier eslint-plugin-prettier lint-staged pino-pretty prettier ts-node tsx typescript dotenv-cli @typescript-eslint/eslint-plugin @eslint/js husky @commitlint/cli @commitlint/config-conventional @types/bcrypt @types/jsonwebtoken @types/ws @types/pg --save-dev
```

6. Pull in the postgresql docker image

```bash
docker pull postgres # postgres
```

7. Set up and start the database.

**Option 1: start them individually**.

```bash
# update the start command to suit your setup, and start databases for all the 3 environments using docker.

docker run -d --name container-name -p 543x:5432 -e POSTGRES_USER=your-user-name -e POSTGRES_PASSWORD=your-password -e POSTGRES_DB=database-name postgres
```

E.g.

```bash
# for dev:

docker run -d --name multi_db_nodejs_express_with_typescript_template__postgres_dev -p 5433:5432 -e POSTGRES_USER=your-user-name -e POSTGRES_PASSWORD=your-password -e POSTGRES_DB=multi_db_nodejs_express_with_typescript_template__db_dev postgres
```

```bash
# for staging:

docker run -d --name multi_db_nodejs_express_with_typescript_template__postgres_staging -p 5434:5432 -e POSTGRES_USER=your-user-name -e POSTGRES_PASSWORD=your-password -e POSTGRES_DB=multi_db_nodejs_express_with_typescript_template__db_staging postgres
```

```bash
# for prod:

docker run -d --name multi_db_nodejs_express_with_typescript_template__postgres_prod -p 5435:5432 -e POSTGRES_USER=your-user-name -e POSTGRES_PASSWORD=your-password -e POSTGRES_DB=multi_db_nodejs_express_with_typescript_template__db_prod postgres
```

> P.S: starting docker postgres instances for `staging` and `prod` may not be necessary since you would want to use real(remotely provisioned) databases for those.

**Option 2: update the `docker-compose.yaml` file on the project's root, using the `docker-compose.postgres.template.yaml` file as a guide. Then start all the databases at once**.

```bash
docker compose up -d
```

CONNECT YOUR DATABASES TO A POSTGRESQL GUI SOFTWARE/SERVICE - E.G PGADMIN - TO VIEW THEM.

8. Start your main app/API server.

```bash
npm run dev
```

If successfully connected, you will see a response similar to the one below - inside your terminal.

```bash
[06:23:32.000] INFO: Establishing database connection
[06:23:32.000] INFO: ...................................
Connected to: localhost
Environment: development

PostgreSQL connected successfully
........................................................
[06:23:32.000] INFO: ...................................
WebSocket server is listening on port 5000
WebSocket: ws://localhost:5000/ws

HTTP server is listening on port 5000
HTTP: http://localhost:5000

Environment: development
........................................................
```

Your API server should start up and be accessible via port 5000 - `http://localhost:5000`. On visiting it, a Pretty-print response like the one below indicates that you're started and all good to go.

```json
{
  "responseMessage": "Welcome to the Fidelity Health API",
  "response": {
    "apiStatus": "OK - Server is live"
  }
}
```

9. Take a deep breath, reward yourself with a coffee break, and return to hack on.

## Prisma-specific Guides.

Normally, Prisma interacts directly(by default) with a `.env` file that should be on the project root, hence would not know if to use a different(custom) environment variables file - as it actually should for this template. Since this template maintains a decentralized environmental variables file structure, the `dotenv-cli` package(a package that should already be installed at the project dependencies-installation stage - if you followed the instructions properly), is used to specify which environmental variables file to use against prisma commands.

Below is a sample command for running a migration against the PostgreSQL database in Prisma dev mode.

```bash
npx dotenv -e .env.development -- npx prisma migrate dev --name migration-name
```

E.g.

```bash
npx dotenv -e .env.development -- npx prisma migrate dev --name init
```

And this for regenerating the Prisma client.

```bash
npx dotenv -e .env.development -- npx prisma generate
```

## Transpiling From Typescript To Javasctipt.

The project as stated earlier, is typescript-heavy. To build(transpile) your project into raw Javascript(with the same exact structure as the TS version) - for deployment or for any other necessary purpose, simply use the build command below.

```bash
npm run build
```

The above commands, transpiles all TS into JS for your project. A **"build"** folder will appear if the command is successfully.

## Building The Template With Docker.

The template comes with a pre-configured `Dockerfile`, and a `.dockerignore`. With these, building it into a Docker image becomes as easy as running the command below.

```bash
docker build -t your-project-name .
```

E.g.

```bash
docker build -t multi_db_nodejs_express_with_typescript_template__docker .
```

> A great way to run the project, would be to set-up a docker-compose configuration that builds the app/server, and starts up the database(s) - all with one single command. This will provide much ease for team-mates(especially seniors and leads) who only wish to assess/test the development progress - and not to contribute.

**SEE `docker-compose.postgres.template.yaml` FOR HELP.**

```bash
docker compose up -d
```

Below are some sample Docker commands to manually start a container that is running the image.

**P.S: The below commands, are quite a combination. They assume that your databases are running on a docker network called - `server_backend_net`. They also require an understanding of Docker networking, and what happens when you're trying to connect a stand-alone docker container to database instances that are running inside other docker containers.**.

```bash
# dev

docker run -d \
  --env-file .env.development \
  -p 5001:5000 \
  --name multi_db_nodejs_express_with_typescript_template__docker_dev \
  --network server_backend_net \
  -e POSTGRES_DATABASE_URL="postgresql://your-user-name:your-password@multi_db_nodejs_express_with_typescript_template__postgres_dev:5432/multi_db_nodejs_express_with_typescript_template__db_dev?schema=public" \
  multi_db_nodejs_express_with_typescript_template__docker
```

```bash
# staging

docker run -d \
  --env-file .env.staging \
  -p 5002:5000 \
  --name multi_db_nodejs_express_with_typescript_template__docker_staging \
  --network server_backend_net \
  -e POSTGRES_DATABASE_URL="postgresql://your-user-name:your-password@multi_db_nodejs_express_with_typescript_template__postgres_staging:5432/multi_db_nodejs_express_with_typescript_template__db_staging?schema=public" \
  multi_db_nodejs_express_with_typescript_template__docker
```

```bash
# prod

docker run -d \
  --env-file .env.production \
  -p 5003:5000 \
  --name multi_db_nodejs_express_with_typescript_template__docker_prod \
  --network server_backend_net \
  -e POSTGRES_DATABASE_URL="postgresql://your-user-name:your-password@multi_db_nodejs_express_with_typescript_template__postgres_prod:5432/multi_db_nodejs_express_with_typescript_template__db_prod?schema=public" \
  multi_db_nodejs_express_with_typescript_template__docker
```

## Enforcing Coding(Contribution) Standards/Rules.

This template is built to support the best industry standards available. Hence enforcing code quality was a core focus.

1. For linting, **ESlint** is used. See `eslint.config.mjs` for all the ESlint configurations.

To lint your project manually, simply run the below command:

```bash
npx eslint .
```

2. For code formatting, **Prettier** was used. See `.prettierrc` and `.prettierignore`, for all the Prettier configurations.

To format your project manually, simply run the below command:

```bash
npx prettier . --write
```

3. As can be seen so far(if left that way), linting and code-formatting would be manual, hence collaborating developers can easily forget to run the necessary checks before pushing their contributions to Github.

To solve that issue and more, **Lint-staged**, **Commitlint**, and **Husky** were used.

Lint-staged with the help of Husky, enforces automatic [Prettier](https://prettier.io/) formatting and [ESlint](https://eslint.org/) linting - **on all staged files**.
On the other hand, [Commitlint](https://commitlint.js.org/) (also using Husky), helps to enforce rules on commit messages - Making sure that collaborating team members write proper commits.

To run Lint-staged manually on currently staged files, use the command below:

```bash
npx lint-staged
```

> P.S: You do not need to run the `lint-staged` command manually. If you follow all instructions, and set up the template correctly, a pre-commit task would be automatically triggered whenever you try to make any code commit to Github. This would, in turn, lint and format your code automatically, while also ensuring commit standards.
>
> All Lint-staged configurations can be found inside the `.lintstagedrc.json` file.

## Sample End-points.

As earlier stated, the project comes with 3 different domains(the `auth` domain, the `user` domain, and the `admin` domain) that help to demonstrate how to keep things modular, domain-driven, neat, and professional.

Below are the default domains and their sample end-point, which you can build on top of - if you wish.

### Default Domains And Their End-points

1. Admin:

- Endpoints:
  1. De-activate user - `/api/v1/admin/deactivate-user/:userId`

2. Auth:

- Endpoints:
  1. Log-in - `/api/v1/auth/log-in`
  2. Register - `/api/v1/auth/register`

2. User:

- Endpoints:
  1. Get user profile - `/api/v1/user/:userId`
  2. Get all user profiles - `/api/v1/user`

## Debugging.

> This section contains a list of issues you might likely encounter while using this template, and how to fix/handle them.

1. Post-installation script error(see `package.json` for reference).

- Issue: Making a project installations while using a VPN caused the `post-install` process to crash.

```shell
Downloading Prisma engines for debian-openssl-3.0.x [                    ] 0%Error: request to https://binaries.prisma.sh/all_commits/9d6ad21cbbceab97458517b147a6a09ff43aa735/debian-openssl-3.0.x/schema-engine.gz.sha256 failed, reason:
# error: postinstall script from "server" exited with 1
```

- Fix: Disable your VPN and try again.

## Want To Contribute?

This project will be a progressive one. I and any other contributor(s), will continue to add relevant updates. This makes it very important that you always share details about any contribution you wish to make - before-hand, and avoid the needless stress of proceeding to work a contribution for a topic that is already in-progress.

To contribute successfully, simply create a Github issues that mentions me, and I'll be right with you to discuss your proposed/intended contribution.

> Feel free to drop a star, fork/use, and share every contributions you possibly can.

## Wrapping up.

> Just in case this repository ever gets to save your butt at work or while learning to build typescript-heavy production-grade Node/Express APIs, and you wish to send an appreciation, [feel free to buy me a 'cup of coffee'](https://paystack.com/pay/cagnddqmr2).

Cheers!!!
