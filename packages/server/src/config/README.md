# Configuration Module

This directory contains the central configuration management system for the application. It is designed for modularity, type safety, and multi-environment support.

## Core Features

- **Multi-Environment Support**: Automatically loads `.env.development`, `.env.staging`, or `.env.production` based on `NODE_ENV`.
- **Zod Validation**: Ensures all environment variables are present and correctly formatted before the server starts.
- **Separated Configurations**: Config is split into specialized objects (DB, JWT, Server, WebSockets) located in the `_` directory to prevent code bloat.

## Directory Structure

```text
src/config/
├── _/                    # Private configuration objects
│   ├── ai.config.ts      # Missie model settings (OpenAI-compatible endpoint)
│   ├── db.config.ts      # PostgreSQL settings
│   ├── jwt.config.ts     # Security and token settings
│   ├── server.config.ts  # Port and environment settings
│   └── ws.config.ts      # WebSocket server settings
├── schema/
│   └── schema.ts         # Zod schema definitions for validation
├── utils/
│   ├── base.ts           # Central validation engine
│   └── envInit.ts        # Environment loader (dotenv logic)
├── index.ts              # Main entry point (re-exports everything)
└── README.md             # This file
```

## Practical Usage

### 1. Database

PostgreSQL is the only database, accessed through Prisma. Set its connection string in the active environment file (e.g. `.env.development`). The server won't start without it:

```bash
POSTGRES_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5433/DATABASE?schema=public
```

### 2. Accessing Configuration

Always import from the main config index. You can destructure specific configuration objects as needed:

```typescript
import { dbConfig, jwtConfig, serverConfig } from '@/config/index.js';

// Accessing settings
console.log(dbConfig.postgresql.url); // 'postgresql://...'
console.log(serverConfig.port); // 5000
```

### 3. Adding New Environment Variables

To add a new configuration setting:

1. Add the variable to your `.env` files.
2. Update the `envSchema` in `src/config/schema/schema.ts`.
3. Add the property to the appropriate specialized config file in `src/config/_/` (e.g., `server.config.ts`).

## Technical Workflow

1. **`utils/envInit.ts`** runs first to load the physical `.env` files into `process.env`.
2. **`utils/base.ts`** imports `envInit.ts`, parses `process.env` against the Zod schema in `schema/schema.ts`, and exports a validated object.
3. Specialized config files in **`_`** import the validated object from `utils/base.ts` to create structured, type-safe exports.
4. **`index.ts`** re-exports everything for clean, single-entry imports.
