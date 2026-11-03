import validatedEnv from '../utils/base.js';

// PostgreSQL is the only database. Prisma connects with `url`.
export const dbConfig = {
  postgresql: {
    url: validatedEnv.POSTGRES_DATABASE_URL,
    user: validatedEnv.POSTGRES_USER,
    dbName: validatedEnv.POSTGRES_DATABASE_NAME
  }
};

export default dbConfig;
