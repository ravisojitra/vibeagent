import type { Config } from 'drizzle-kit';
import * as env from 'dotenv';

// Load environment variables
env.config({ path: '.env.local' });

export default {
    schema: './src/lib/schema.ts',
    out: './drizzle-generated',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
} satisfies Config;