
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as env from 'dotenv';

env.config({ path: '.env.local' });

declare global {
    // Prevent multiple instances of pool in development
    // (Next.js hot reload can re-import this file many times)
    // eslint-disable-next-line no-var
    var cachedPool: Pool | undefined;
    // eslint-disable-next-line no-var
    var cachedDb: ReturnType<typeof drizzle> | undefined;
}
const pool =
    global.cachedPool ||
    new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 5,
        idleTimeoutMillis: 20000,
        connectionTimeoutMillis: 20000,
        maxUses: 7500,
    });

if (process.env.NODE_ENV !== 'production') {
    global.cachedPool = pool;
}

const db = global.cachedDb || drizzle(pool, { schema });

if (process.env.NODE_ENV !== 'production') {
    global.cachedDb = db;
}

export { pool, db };

