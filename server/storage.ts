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
  type HistoricalReport,
  type GeneratePointsRequest
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Route management
  getAllRoutes(): Promise<Route[]>;
  getRoutesBySR(sr: number): Promise<Route[]>;
  
  // Bridge management
  getAllBridges(): Promise<Bridge[]>;
  getBridgesByRoute(route: number, dir?: string): Promise<Bridge[]>;
  
  // Construction limits
  getAllMaintLimits(): Promise<MaintLimitConstruct[]>;
  getMaintLimitsByRoute(route: number, dir?: string): Promise<MaintLimitConstruct[]>;
  
  // Sample points
  getAllSamplePoints(): Promise<SamplePoints[]>;
  getSamplePointsByRoute(route: number, dir?: string): Promise<SamplePoints[]>;
  updateSamplePoints(route: number, dir: string | undefined, noOfPoints: number): Promise<void>;
  
  // Random selections
  clearRandomSelections(): Promise<void>;
  addRandomSelection(selection: Omit<RandomSelection, 'id'>): Promise<RandomSelection>;
  getRandomSelections(): Promise<RandomSelection[]>;
  
  // Generation config
  getGenerationConfig(): Promise<GenerationConfig>;
  updateGenerationConfig(config: Partial<GenerationConfig>): Promise<GenerationConfig>;
  
  // Historical reports
  saveHistoricalReport(title: string, selections: RandomSelection[]): Promise<HistoricalReport>;
  getHistoricalReports(): Promise<HistoricalReport[]>;
  getHistoricalReport(id: number): Promise<HistoricalReport | undefined>;
  deleteHistoricalReport(id: number): Promise<void>;
  clearHistoricalReports(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private routes: Map<number, Route>;
  private bridges: Map<number, Bridge>;
  private maintLimits: Map<number, MaintLimitConstruct>;
  private samplePoints: Map<number, SamplePoints>;
  private randomSelections: Map<number, RandomSelection>;
  private generationConfig: GenerationConfig;
  private historicalReports: Map<number, HistoricalReport>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.routes = new Map();
    this.bridges = new Map();
    this.maintLimits = new Map();
    this.samplePoints = new Map();
    this.randomSelections = new Map();
    this.historicalReports = new Map();
    this.currentId = 1;
    
    // Initialize with default config
    this.generationConfig = {
      id: 1,
      systemType: "centerline",
      increment: 0.1,
      inspectionLength: 264,
      excludeBridgeSections: false,
      excludeBridgePoints: true,
      altPoints: 3,
    };
    
    // Initialize with default routes and sample points
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default routes data based on the VBA code and PDF
    const defaultRoutes = [
      { sr: 112, dir: "CL", beg: 0.0, end: 4.2 },
      { sr: 836, dir: "CL", beg: 0.0, end: 12.6 },
      { sr: 874, dir: "CL", beg: 3.8, end: 6.6 },
      { sr: 878, dir: "CL", beg: 0.0, end: 3.2 },
      { sr: 924, dir: "CL", beg: 0.0, end: 5.3 },
    ];

    const defaultSamplePoints = [
      { route: 112, dir: "CL", noOfPoints: 11 },
      { route: 836, dir: "CL", noOfPoints: 25 },
      { route: 874, dir: "CL", noOfPoints: 18 },
      { route: 878, dir: "CL", noOfPoints: 7 },
      { route: 924, dir: "CL", noOfPoints: 14 },
    ];

    // Bridge data extracted from Bridges_*.xlsx
    const defaultBridges = [
      { route: 112, dir: "CL", beginMP: 1.2, endMP: 1.4 },
      { route: 836, dir: "CL", beginMP: 3.8, endMP: 4.1 },
      { route: 836, dir: "CL", beginMP: 8.2, endMP: 8.5 },
      { route: 874, dir: "CL", beginMP: 4.9, endMP: 5.2 },
      { route: 878, dir: "CL", beginMP: 1.8, endMP: 2.1 },
      { route: 924, dir: "CL", beginMP: 2.3, endMP: 2.6 },
      { route: 924, dir: "CL", beginMP: 4.1, endMP: 4.4 },
    ];

    // Maintenance/Construction limits extracted from MaintLimitConstruct_*.xlsx
    const defaultMaintLimits = [
      { route: 836, dir: "CL", beginMP: 6.0, endMP: 7.5 },
      { route: 874, dir: "CL", beginMP: 4.2, endMP: 4.8 },
      { route: 924, dir: "CL", beginMP: 1.0, endMP: 1.8 },
    ];

    // Add default routes
    defaultRoutes.forEach(route => {
      const id = this.currentId++;
      this.routes.set(id, { id, ...route });
    });

    // Add default sample points
    defaultSamplePoints.forEach(sp => {
      const id = this.currentId++;
      this.samplePoints.set(id, { id, ...sp });
    });

    // Add bridge data
    defaultBridges.forEach(bridge => {
      const id = this.currentId++;
      this.bridges.set(id, { id, ...bridge });
    });

    // Add maintenance limits
    defaultMaintLimits.forEach(limit => {
      const id = this.currentId++;
      this.maintLimits.set(id, { id, ...limit });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoutesBySR(sr: number): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(route => route.sr === sr);
  }

  async getAllBridges(): Promise<Bridge[]> {
    return Array.from(this.bridges.values());
  }

  async getBridgesByRoute(route: number, dir?: string): Promise<Bridge[]> {
    return Array.from(this.bridges.values()).filter(bridge => 
      bridge.route === route && (dir ? bridge.dir === dir : true)
    );
  }

  async getAllMaintLimits(): Promise<MaintLimitConstruct[]> {
    return Array.from(this.maintLimits.values());
  }

  async getMaintLimitsByRoute(route: number, dir?: string): Promise<MaintLimitConstruct[]> {
    return Array.from(this.maintLimits.values()).filter(limit => 
      limit.route === route && (dir ? limit.dir === dir : true)
    );
  }

  async getAllSamplePoints(): Promise<SamplePoints[]> {
    return Array.from(this.samplePoints.values());
  }

  async getSamplePointsByRoute(route: number, dir?: string): Promise<SamplePoints[]> {
    return Array.from(this.samplePoints.values()).filter(sp => 
      sp.route === route && (dir ? sp.dir === dir : true)
    );
  }

  async updateSamplePoints(route: number, dir: string | undefined, noOfPoints: number): Promise<void> {
    const existing = Array.from(this.samplePoints.values()).find(sp => 
      sp.route === route && sp.dir === dir
    );
    
    if (existing) {
      existing.noOfPoints = noOfPoints;
    } else {
      const id = this.currentId++;
      this.samplePoints.set(id, { id, route, dir: dir || null, noOfPoints });
    }
  }

  async clearRandomSelections(): Promise<void> {
    this.randomSelections.clear();
  }

  async addRandomSelection(selection: Omit<RandomSelection, 'id'>): Promise<RandomSelection> {
    const id = this.currentId++;
    const newSelection: RandomSelection = { id, ...selection };
    this.randomSelections.set(id, newSelection);
    return newSelection;
  }

  async getRandomSelections(): Promise<RandomSelection[]> {
    return Array.from(this.randomSelections.values());
  }

  async getGenerationConfig(): Promise<GenerationConfig> {
    return this.generationConfig;
  }

  async updateGenerationConfig(config: Partial<GenerationConfig>): Promise<GenerationConfig> {
    this.generationConfig = { ...this.generationConfig, ...config };
    return this.generationConfig;
  }

  async saveHistoricalReport(title: string, selections: RandomSelection[]): Promise<HistoricalReport> {
    const totalPoints = selections.length;
    const mainPoints = selections.filter(s => s.selType === 'Main').length;
    const altPoints = totalPoints - mainPoints;
    
    // Get unique routes
    const routeSet = new Set(selections.map(s => `SR ${s.route}`));
    const uniqueRoutes = Array.from(routeSet).sort();
    
    const report: HistoricalReport = {
      id: this.currentId++,
      title,
      generatedDate: new Date().toISOString(),
      totalPoints,
      mainPoints,
      altPoints,
      routes: JSON.stringify(uniqueRoutes),
      reportData: JSON.stringify(selections)
    };
    
    this.historicalReports.set(report.id, report);
    return report;
  }

  async getHistoricalReports(): Promise<HistoricalReport[]> {
    return Array.from(this.historicalReports.values())
      .sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime());
  }

  async getHistoricalReport(id: number): Promise<HistoricalReport | undefined> {
    return this.historicalReports.get(id);
  }

  async deleteHistoricalReport(id: number): Promise<void> {
    this.historicalReports.delete(id);
  }

  async clearHistoricalReports(): Promise<void> {
    this.historicalReports.clear();
  }
}

export const storage = new MemStorage();
