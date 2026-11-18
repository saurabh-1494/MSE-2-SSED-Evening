
import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// Prevent unexpected idle-client errors from crashing the backend.
pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

export async function waitForDatabase() {
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      await pool.query('SELECT 1');
      console.log('PostgreSQL connection established');
      return;
    } catch (error) {
      console.log(
        `Waiting for PostgreSQL (${attempt}/30): ${error.message}`
      );

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error('Could not connect to PostgreSQL after 30 attempts');
}
