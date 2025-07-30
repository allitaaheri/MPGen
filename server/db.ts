import { DatabaseStorage } from "./storage-db";
import { MemStorage } from "./storage";

// Use database storage if DATABASE_URL is provided, otherwise use in-memory storage
export const db = process.env.DATABASE_URL 
  ? new DatabaseStorage()
  : new MemStorage();