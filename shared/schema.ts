import { pgTable, text, serial, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  sr: integer("sr").notNull(),
  dir: text("dir").notNull(),
  beg: real("beg").notNull(),
  end: real("end").notNull(),
});

export const bridges = pgTable("bridges", {
  id: serial("id").primaryKey(),
  route: integer("route").notNull(),
  dir: text("dir"),
  beginMP: real("beginMP").notNull(),
  endMP: real("endMP").notNull(),
});

export const maintLimitConstruct = pgTable("maintLimitConstruct", {
  id: serial("id").primaryKey(),
  route: integer("route").notNull(),
  dir: text("dir"),
  beginMP: real("beginMP").notNull(),
  endMP: real("endMP").notNull(),
});

export const samplePoints = pgTable("samplePoints", {
  id: serial("id").primaryKey(),
  route: integer("route").notNull(),
  dir: text("dir"),
  noOfPoints: integer("noOfPoints").notNull(),
});

export const randomSelections = pgTable("randomSelections", {
  id: serial("id").primaryKey(),
  route: integer("route").notNull(),
  dir: text("dir").notNull(),
  milepost: real("milepost").notNull(),
  selType: text("selType").notNull(),
});

export const generationConfig = pgTable("generationConfig", {
  id: serial("id").primaryKey(),
  systemType: text("systemType").notNull().default("directional"),
  increment: real("increment").notNull().default(0.1),
  inspectionLength: integer("inspectionLength").notNull().default(264),
  excludeBridgeSections: boolean("excludeBridgeSections").notNull().default(true),
  excludeBridgePoints: boolean("excludeBridgePoints").notNull().default(false),
  altPoints: integer("altPoints").notNull().default(3),
});

export const historicalReports = pgTable("historicalReports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  generatedDate: text("generatedDate").notNull(), // ISO string format
  totalPoints: integer("totalPoints").notNull(),
  mainPoints: integer("mainPoints").notNull(),
  altPoints: integer("altPoints").notNull(),
  routes: text("routes").notNull(), // JSON array as string
  reportData: text("reportData").notNull(), // JSON array of RandomSelection objects
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRouteSchema = createInsertSchema(routes);
export const insertBridgeSchema = createInsertSchema(bridges);
export const insertMaintLimitConstructSchema = createInsertSchema(maintLimitConstruct);
export const insertSamplePointsSchema = createInsertSchema(samplePoints);
export const insertRandomSelectionsSchema = createInsertSchema(randomSelections);
export const insertGenerationConfigSchema = createInsertSchema(generationConfig);
export const insertHistoricalReportSchema = createInsertSchema(historicalReports);

export const routeConfigSchema = z.object({
  routes: z.array(z.object({
    sr: z.number(),
    mainPoints: z.number().min(1),
  })),
});

export const generatePointsSchema = z.object({
  systemType: z.enum(["directional", "centerline"]),
  increment: z.number().positive(),
  inspectionLength: z.number().positive(),
  excludeBridgeSections: z.boolean(),
  excludeBridgePoints: z.boolean(),
  altPoints: z.number().min(0),
  routes: z.array(z.object({
    sr: z.number(),
    mainPoints: z.number().min(1),
  })),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Route = typeof routes.$inferSelect;
export type Bridge = typeof bridges.$inferSelect;
export type MaintLimitConstruct = typeof maintLimitConstruct.$inferSelect;
export type SamplePoints = typeof samplePoints.$inferSelect;
export type RandomSelection = typeof randomSelections.$inferSelect;
export type GenerationConfig = typeof generationConfig.$inferSelect;
export type HistoricalReport = typeof historicalReports.$inferSelect;
export type RouteConfig = z.infer<typeof routeConfigSchema>;
export type GeneratePointsRequest = z.infer<typeof generatePointsSchema>;
