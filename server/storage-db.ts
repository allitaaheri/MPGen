import { dbConnection } from './database';
import { eq, and } from 'drizzle-orm';
import { 
  users, 
  routes, 
  bridges, 
  maintLimitConstruct, 
  samplePoints, 
  randomSelections,
  generationConfig,
  historicalReports,
  type User, 
  type InsertUser,
  type Route,
  type Bridge,
  type MaintLimitConstruct,
  type SamplePoints,
  type RandomSelection,
  type GenerationConfig,
  type HistoricalReport
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    this.db = dbConnection;
    this.initializeData();
  }

  private async initializeData() {
    // Initialize with default route data if empty
    const existingRoutes = await this.getAllRoutes();
    if (existingRoutes.length === 0) {
      await this.seedInitialData();
    }
  }

  private async seedInitialData() {
    // Insert default routes
    const defaultRoutes = [
      { id: 1, sr: 112, dir: "CL", beg: 0, end: 29.99, enabled: true },
      { id: 2, sr: 836, dir: "CL", beg: 0, end: 25.86, enabled: true },
      { id: 3, sr: 874, dir: "CL", beg: 0, end: 11.57, enabled: true },
      { id: 4, sr: 878, dir: "CL", beg: 0, end: 8.88, enabled: true },
      { id: 5, sr: 924, dir: "CL", beg: 0, end: 7.13, enabled: true }
    ];

    for (const route of defaultRoutes) {
      await this.db.insert(routes).values(route).onConflictDoNothing();
    }

    // Insert default bridges (examples from your data)
    const defaultBridges = [
      { route: 112, dir: "CL", beginMP: 4.123, endMP: 4.623, milepost: 4.123, length: 264 },
      { route: 836, dir: "CL", beginMP: 8.456, endMP: 8.956, milepost: 8.456, length: 198 },
      { route: 874, dir: "CL", beginMP: 2.789, endMP: 3.289, milepost: 2.789, length: 330 },
      { route: 878, dir: "CL", beginMP: 5.234, endMP: 5.734, milepost: 5.234, length: 264 },
      { route: 924, dir: "CL", beginMP: 3.567, endMP: 4.067, milepost: 3.567, length: 198 }
    ];

    for (const bridge of defaultBridges) {
      await this.db.insert(bridges).values(bridge).onConflictDoNothing();
    }

    // Insert default sample points
    const defaultSamplePoints = [
      { id: 1, route: 112, dir: "CL", noOfPoints: 10 },
      { id: 2, route: 836, dir: "CL", noOfPoints: 8 },
      { id: 3, route: 874, dir: "CL", noOfPoints: 6 },
      { id: 4, route: 878, dir: "CL", noOfPoints: 4 },
      { id: 5, route: 924, dir: "CL", noOfPoints: 4 }
    ];

    for (const sp of defaultSamplePoints) {
      await this.db.insert(samplePoints).values(sp).onConflictDoNothing();
    }

    // Insert default generation config
    await this.db.insert(generationConfig).values({
      systemType: "centerline",
      increment: 264,
      inspectionLength: 264,
      excludeBridgeSections: true,
      excludeBridgePoints: true,
      altPoints: 3
    }).onConflictDoNothing();
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async getAllRoutes(): Promise<Route[]> {
    return await this.db.select().from(routes);
  }

  async getRoutesBySR(sr: number): Promise<Route[]> {
    return await this.db.select().from(routes).where(eq(routes.sr, sr));
  }

  async getAllBridges(): Promise<Bridge[]> {
    return await this.db.select().from(bridges);
  }

  async getBridgesByRoute(route: number, dir?: string): Promise<Bridge[]> {
    if (dir) {
      return await this.db.select().from(bridges)
        .where(and(eq(bridges.route, route), eq(bridges.dir, dir)));
    }
    return await this.db.select().from(bridges).where(eq(bridges.route, route));
  }

  async getAllMaintLimits(): Promise<MaintLimitConstruct[]> {
    return await this.db.select().from(maintLimitConstruct);
  }

  async getMaintLimitsByRoute(route: number, dir?: string): Promise<MaintLimitConstruct[]> {
    if (dir) {
      return await this.db.select().from(maintLimitConstruct)
        .where(and(eq(maintLimitConstruct.route, route), eq(maintLimitConstruct.dir, dir)));
    }
    return await this.db.select().from(maintLimitConstruct).where(eq(maintLimitConstruct.route, route));
  }

  async getAllSamplePoints(): Promise<SamplePoints[]> {
    return await this.db.select().from(samplePoints);
  }

  async getSamplePointsByRoute(route: number, dir?: string): Promise<SamplePoints[]> {
    if (dir) {
      return await this.db.select().from(samplePoints)
        .where(and(eq(samplePoints.route, route), eq(samplePoints.dir, dir)));
    }
    return await this.db.select().from(samplePoints).where(eq(samplePoints.route, route));
  }

  async updateSamplePoints(route: number, dir: string | undefined, noOfPoints: number): Promise<void> {
    if (dir) {
      await this.db.update(samplePoints)
        .set({ noOfPoints })
        .where(and(eq(samplePoints.route, route), eq(samplePoints.dir, dir)));
    } else {
      await this.db.update(samplePoints)
        .set({ noOfPoints })
        .where(eq(samplePoints.route, route));
    }
  }

  async clearRandomSelections(): Promise<void> {
    await this.db.delete(randomSelections);
  }

  async addRandomSelection(selection: Omit<RandomSelection, 'id'>): Promise<RandomSelection> {
    const result = await this.db.insert(randomSelections).values(selection).returning();
    return result[0];
  }

  async getRandomSelections(): Promise<RandomSelection[]> {
    return await this.db.select().from(randomSelections);
  }

  async getGenerationConfig(): Promise<GenerationConfig> {
    const result = await this.db.select().from(generationConfig);
    if (result.length === 0) {
      // Create default config if none exists
      const defaultConfig = {
        systemType: "centerline" as const,
        increment: 264,
        inspectionLength: 264,
        excludeBridgeSections: true,
        excludeBridgePoints: true,
        altPoints: 3
      };
      const created = await this.db.insert(generationConfig).values(defaultConfig).returning();
      return created[0];
    }
    return result[0];
  }

  async updateGenerationConfig(config: Partial<GenerationConfig>): Promise<GenerationConfig> {
    const current = await this.getGenerationConfig();
    const updated = { ...current, ...config };
    const result = await this.db.update(generationConfig)
      .set(updated)
      .where(eq(generationConfig.id, current.id))
      .returning();
    return result[0];
  }

  async saveHistoricalReport(title: string, selections: RandomSelection[]): Promise<HistoricalReport> {
    const report = {
      title,
      generatedAt: new Date(),
      routes: JSON.stringify(selections.map(s => s.route)),
      altPoints: selections.length > 0 ? selections[0].altPoints?.split(',').length || 0 : 0,
      selectionData: JSON.stringify(selections)
    };
    const result = await this.db.insert(historicalReports).values(report).returning();
    return result[0];
  }

  async getHistoricalReports(): Promise<HistoricalReport[]> {
    return await this.db.select().from(historicalReports);
  }

  async getHistoricalReport(id: number): Promise<HistoricalReport | undefined> {
    const result = await this.db.select().from(historicalReports).where(eq(historicalReports.id, id));
    return result[0];
  }

  async deleteHistoricalReport(id: number): Promise<void> {
    await this.db.delete(historicalReports).where(eq(historicalReports.id, id));
  }

  async clearHistoricalReports(): Promise<void> {
    await this.db.delete(historicalReports);
  }
}