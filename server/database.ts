import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema.js";

// AWS RDS connection configuration for Elastic Beanstalk
const getConnectionConfig = () => {
  if (process.env.RDS_HOSTNAME) {
    // AWS RDS environment variables (auto-configured by Elastic Beanstalk)
    return {
      host: process.env.RDS_HOSTNAME,
      port: parseInt(process.env.RDS_PORT || "5432"),
      database: process.env.RDS_DB_NAME,
      user: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }
  
  // Fallback for local development
  return {
    connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/rmpg",
    max: 5,
  };
};

const pool = new Pool(getConnectionConfig());

// Handle pool errors
pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

export const dbConnection = drizzle(pool, { schema });
export { pool };