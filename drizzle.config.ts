import { defineConfig } from "drizzle-kit";

// AWS RDS configuration for Elastic Beanstalk
const getRDSConnectionString = () => {
  if (process.env.RDS_HOSTNAME) {
    // AWS RDS environment variables (auto-configured by Elastic Beanstalk)
    return `postgresql://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DB_NAME}`;
  }
  
  // Fallback for local development
  return process.env.DATABASE_URL || "postgresql://localhost:5432/rmpg";
};

export default defineConfig({
  out: "./drizzle",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getRDSConnectionString(),
  },
});