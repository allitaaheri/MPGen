// AGOL Adapter - Replaces server-side storage with AGOL Feature Services
import {
  AGOLRoutesService,
  AGOLBridgesService, 
  AGOLMaintLimitsService,
  AGOLSamplePointsService,
  AGOLRandomSelectionsService,
  AGOLGenerationConfigService,
  AGOLHistoricalReportsService
} from "./agolClient";

import type { 
  Route, Bridge, MaintLimitConstruct, SamplePoints, 
  RandomSelection, GenerationConfig, HistoricalReport,

  GeneratePointsRequest
} from "@shared/schema";

// This adapter provides the same interface as the server storage
// but uses AGOL Feature Services instead of PostgreSQL
export class AGOLStorageAdapter {
  // Routes
  async getAllRoutes(): Promise<Route[]> {
    return AGOLRoutesService.getAllRoutes();
  }

  async getRoutesBySR(sr: number): Promise<Route[]> {
    return AGOLRoutesService.getRoutesBySR(sr);
  }

  // Bridges
  async getAllBridges(): Promise<Bridge[]> {
    return AGOLBridgesService.getAllBridges();
  }

  async getBridgesByRoute(route: number, dir?: string): Promise<Bridge[]> {
    return AGOLBridgesService.getBridgesByRoute(route, dir);
  }

  // Maintenance Limits
  async getAllMaintLimits(): Promise<MaintLimitConstruct[]> {
    return AGOLMaintLimitsService.getAllMaintLimits();
  }

  async getMaintLimitsByRoute(route: number, dir?: string): Promise<MaintLimitConstruct[]> {
    return AGOLMaintLimitsService.getMaintLimitsByRoute(route, dir);
  }

  // Sample Points
  async getAllSamplePoints(): Promise<SamplePoints[]> {
    return AGOLSamplePointsService.getAllSamplePoints();
  }

  async getSamplePointsByRoute(route: number, dir?: string): Promise<SamplePoints[]> {
    return AGOLSamplePointsService.getSamplePointsByRoute(route, dir);
  }

  async updateSamplePoints(route: number, dir: string, noOfPoints: number): Promise<void> {
    return AGOLSamplePointsService.updateSamplePoints(route, dir, noOfPoints);
  }

  // Random Selections
  async getAllRandomSelections(): Promise<RandomSelection[]> {
    return AGOLRandomSelectionsService.getAllRandomSelections();
  }

  async addRandomSelection(selection: Omit<RandomSelection, 'id'>): Promise<RandomSelection> {
    return AGOLRandomSelectionsService.addRandomSelection(selection);
  }

  async clearRandomSelections(): Promise<void> {
    return AGOLRandomSelectionsService.clearRandomSelections();
  }

  // Generation Config
  async getGenerationConfig(): Promise<GenerationConfig> {
    return AGOLGenerationConfigService.getGenerationConfig();
  }

  async updateGenerationConfig(config: Partial<GenerationConfig>): Promise<GenerationConfig> {
    return AGOLGenerationConfigService.updateGenerationConfig(config);
  }

  // Historical Reports
  async getHistoricalReports(): Promise<HistoricalReport[]> {
    return AGOLHistoricalReportsService.getHistoricalReports();
  }

  async getHistoricalReport(id: number): Promise<HistoricalReport | undefined> {
    return AGOLHistoricalReportsService.getHistoricalReport(id);
  }

  async addHistoricalReport(report: Omit<HistoricalReport, 'id'>): Promise<HistoricalReport> {
    return AGOLHistoricalReportsService.addHistoricalReport(report);
  }
}

// Client-side Random Point Generator (moved from server)
export class ClientRandomPointGenerator {
  private static isGenerating = false;
  private static progressCallback?: (progress: { currentRoute: string; progress: number; total: number; message: string }) => void;
  private static storage = new AGOLStorageAdapter();

  static setProgressCallback(callback: (progress: { currentRoute: string; progress: number; total: number; message: string }) => void) {
    this.progressCallback = callback;
  }

  static async generateRandomPoints(config: GeneratePointsRequest): Promise<RandomSelection[]> {
    if (this.isGenerating) {
      throw new Error("Generation already in progress");
    }

    this.isGenerating = true;
    
    try {
      // Clear existing selections
      await this.storage.clearRandomSelections();
      
      const results: RandomSelection[] = [];
      let totalSteps = 0;
      let currentStep = 0;

      // Calculate total steps for progress tracking
      for (const routeConfig of config.routes) {
        const routes = await this.storage.getRoutesBySR(routeConfig.sr);
        totalSteps += routes.length;
      }

      // Process each route
      for (const routeConfig of config.routes) {
        const routes = await this.storage.getRoutesBySR(routeConfig.sr);
        
        for (const route of routes) {
          currentStep++;
          
          if (this.progressCallback) {
            this.progressCallback({
              currentRoute: `SR ${route.sr}`,
              progress: currentStep,
              total: totalSteps,
              message: `Generating points for SR ${route.sr}`
            });
          }

          // Update sample points for this route
          await this.storage.updateSamplePoints(route.sr, route.dir, routeConfig.mainPoints);

          // Generate main points
          const mainPoints = await this.generatePointsForRoute(
            route,
            routeConfig.mainPoints,
            "Main",
            config
          );
          results.push(...mainPoints);

          // Generate alternative points
          const altPoints = await this.generatePointsForRoute(
            route,
            config.altPoints,
            "Alt",
            config
          );
          results.push(...altPoints);
        }
      }

      return results;
    } finally {
      this.isGenerating = false;
    }
  }

  private static async generatePointsForRoute(
    route: Route,
    pointCount: number,
    pointType: "Main" | "Alt",
    config: GeneratePointsRequest
  ): Promise<RandomSelection[]> {
    const results: RandomSelection[] = [];
    const usedPoints = new Set<number>();
    const totalSteps = Math.ceil((route.end - route.beg) / config.increment);

    for (let i = 0; i < pointCount; i++) {
      let validPoint = false;
      let attempts = 0;
      const maxAttempts = totalSteps * 2;

      while (!validPoint && attempts < maxAttempts) {
        attempts++;
        
        // Generate random step
        const randomStep = Math.floor(Math.random() * totalSteps);
        
        if (usedPoints.has(randomStep)) {
          continue;
        }

        // Calculate milepost
        const milepost = route.beg + (randomStep * config.increment);

        if (milepost > route.end) {
          continue;
        }

        // Check bridge constraints
        if (config.excludeBridgeSections || config.excludeBridgePoints) {
          const isOnBridge = await this.checkBridgeConstraints(
            route.sr,
            route.dir,
            milepost,
            config
          );
          if (isOnBridge) {
            continue;
          }
        }

        // Check construction limits
        const isInConstructionZone = await this.checkConstructionConstraints(
          route.sr,
          route.dir,
          milepost,
          config
        );
        if (isInConstructionZone) {
          continue;
        }

        // Point is valid
        usedPoints.add(randomStep);
        validPoint = true;

        const selType = pointType === "Main" ? "Main" : `X${pointCount - i}`;
        
        const selection = await this.storage.addRandomSelection({
          route: route.sr,
          dir: route.dir,
          milepost: Math.round(milepost * 100) / 100, // Round to 2 decimal places
          selType
        });
        
        results.push(selection);
      }

      if (!validPoint) {
        throw new Error(`Could not generate valid point ${i + 1} for route ${route.sr}`);
      }
    }

    return results;
  }

  private static async checkBridgeConstraints(
    routeSR: number,
    dir: string,
    milepost: number,
    config: GeneratePointsRequest
  ): Promise<boolean> {
    const bridges = await this.storage.getBridgesByRoute(routeSR, config.systemType === "centerline" ? undefined : dir);
    const bufferDistance = (config.inspectionLength / 2) / 5280; // Convert feet to miles

    for (const bridge of bridges) {
      if (config.excludeBridgeSections) {
        // Check if point is within buffer distance of bridge
        const bufferStart = bridge.beginMP - bufferDistance;
        const bufferEnd = bridge.endMP + bufferDistance;
        
        if (milepost >= bufferStart && milepost <= bufferEnd) {
          return true;
        }
      }

      if (config.excludeBridgePoints) {
        // Check if point is directly on bridge
        if (milepost >= bridge.beginMP && milepost <= bridge.endMP) {
          return true;
        }
      }
    }

    return false;
  }

  private static async checkConstructionConstraints(
    routeSR: number,
    dir: string,
    milepost: number,
    config: GeneratePointsRequest
  ): Promise<boolean> {
    const maintLimits = await this.storage.getMaintLimitsByRoute(routeSR, config.systemType === "centerline" ? undefined : dir);
    const bufferDistance = (config.inspectionLength / 2) / 5280; // Convert feet to miles

    for (const limit of maintLimits) {
      const bufferStart = limit.beginMP - bufferDistance;
      const bufferEnd = limit.endMP + bufferDistance;
      
      if (milepost >= bufferStart && milepost <= bufferEnd) {
        return true;
      }
    }

    return false;
  }
}

// Create singleton instance
export const agolStorage = new AGOLStorageAdapter();