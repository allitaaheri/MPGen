import { storage } from "../storage";
import type { GeneratePointsRequest, RandomSelection } from "@shared/schema";

export interface GenerationProgress {
  currentRoute: string;
  progress: number;
  total: number;
  message: string;
}

export class RandomPointGenerator {
  private static isGenerating = false;
  private static progressCallback?: (progress: GenerationProgress) => void;

  static setProgressCallback(callback: (progress: GenerationProgress) => void) {
    this.progressCallback = callback;
  }

  static async generateRandomPoints(config: GeneratePointsRequest): Promise<RandomSelection[]> {
    if (this.isGenerating) {
      throw new Error("Generation already in progress");
    }

    this.isGenerating = true;
    
    try {
      // Clear existing selections
      await storage.clearRandomSelections();
      
      const results: RandomSelection[] = [];
      let totalSteps = 0;
      let currentStep = 0;

      // Calculate total steps for progress tracking
      for (const routeConfig of config.routes) {
        const routes = await storage.getRoutesBySR(routeConfig.sr);
        totalSteps += routes.length;
      }

      // Process each route
      for (const routeConfig of config.routes) {
        const routes = await storage.getRoutesBySR(routeConfig.sr);
        
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
          await storage.updateSamplePoints(route.sr, route.dir, routeConfig.mainPoints);

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

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return results;
    } finally {
      this.isGenerating = false;
    }
  }

  private static async generatePointsForRoute(
    route: any,
    pointCount: number,
    pointType: string,
    config: GeneratePointsRequest
  ): Promise<RandomSelection[]> {
    const results: RandomSelection[] = [];
    const steps = Math.floor((route.end - route.beg) / config.increment);
    
    if (steps <= pointCount) {
      throw new Error(`Insufficient route length for ${route.sr}. Reduce points or increase increment.`);
    }

    const usedPoints = new Set<number>();
    let attempts = 0;
    const maxAttempts = steps * 10; // Prevent infinite loops

    for (let i = 0; i < pointCount; i++) {
      let validPoint = false;
      
      while (!validPoint && attempts < maxAttempts) {
        attempts++;
        
        // Generate random step
        const randomStep = Math.floor(Math.random() * steps) + 1;
        const milepost = route.beg + (randomStep * config.increment);

        // Check if already chosen
        if (usedPoints.has(randomStep)) {
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
        
        const selection = await storage.addRandomSelection({
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
    const bridges = await storage.getBridgesByRoute(routeSR, config.systemType === "centerline" ? undefined : dir);
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
    const maintLimits = await storage.getMaintLimitsByRoute(routeSR, config.systemType === "centerline" ? undefined : dir);
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
