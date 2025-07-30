import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import type { 
  Route, Bridge, MaintLimitConstruct, SamplePoints, 
  RandomSelection, GenerationConfig, HistoricalReport
} from "@shared/schema";

// AGOL Configuration
export const AGOL_CONFIG = {
  // These will be feature service URLs in your ArcGIS Online organization
  ROUTES_SERVICE_URL: "",
  BRIDGES_SERVICE_URL: "",
  MAINT_LIMITS_SERVICE_URL: "",
  SAMPLE_POINTS_SERVICE_URL: "",
  RANDOM_SELECTIONS_SERVICE_URL: "",
  GENERATION_CONFIG_SERVICE_URL: "",
  HISTORICAL_REPORTS_SERVICE_URL: "",
  
  // Portal configuration
  PORTAL_URL: "https://www.arcgis.com",
  APP_ID: "", // Your registered app ID
};

// Feature Layer References
let routesLayer: FeatureLayer;
let bridgesLayer: FeatureLayer;
let maintLimitsLayer: FeatureLayer;
let samplePointsLayer: FeatureLayer;
let randomSelectionsLayer: FeatureLayer;
let generationConfigLayer: FeatureLayer;
let historicalReportsLayer: FeatureLayer;

// Initialize AGOL Feature Layers
export function initializeAGOLLayers() {
  // Routes Layer
  routesLayer = new FeatureLayer({
    url: AGOL_CONFIG.ROUTES_SERVICE_URL,
    outFields: ["*"]
  });

  // Bridges Layer
  bridgesLayer = new FeatureLayer({
    url: AGOL_CONFIG.BRIDGES_SERVICE_URL,
    outFields: ["*"]
  });

  // Maintenance Limits Layer
  maintLimitsLayer = new FeatureLayer({
    url: AGOL_CONFIG.MAINT_LIMITS_SERVICE_URL,
    outFields: ["*"]
  });

  // Sample Points Layer
  samplePointsLayer = new FeatureLayer({
    url: AGOL_CONFIG.SAMPLE_POINTS_SERVICE_URL,
    outFields: ["*"]
  });

  // Random Selections Layer
  randomSelectionsLayer = new FeatureLayer({
    url: AGOL_CONFIG.RANDOM_SELECTIONS_SERVICE_URL,
    outFields: ["*"]
  });

  // Generation Config Layer
  generationConfigLayer = new FeatureLayer({
    url: AGOL_CONFIG.GENERATION_CONFIG_SERVICE_URL,
    outFields: ["*"]
  });

  // Historical Reports Layer
  historicalReportsLayer = new FeatureLayer({
    url: AGOL_CONFIG.HISTORICAL_REPORTS_SERVICE_URL,
    outFields: ["*"]
  });
}

// Helper function to convert feature to typed object
function featureToObject<T>(feature: any, idField: string = "OBJECTID"): T {
  return {
    id: feature.attributes[idField],
    ...feature.attributes
  } as T;
}

// Routes Operations
export class AGOLRoutesService {
  static async getAllRoutes(): Promise<Route[]> {
    const query = routesLayer.createQuery();
    query.where = "1=1";
    const result = await routesLayer.queryFeatures(query);
    return result.features.map(f => featureToObject<Route>(f));
  }

  static async getRoutesBySR(sr: number): Promise<Route[]> {
    const query = routesLayer.createQuery();
    query.where = `sr = ${sr}`;
    const result = await routesLayer.queryFeatures(query);
    return result.features.map(f => featureToObject<Route>(f));
  }
}

// Bridges Operations
export class AGOLBridgesService {
  static async getAllBridges(): Promise<Bridge[]> {
    const query = bridgesLayer.createQuery();
    query.where = "1=1";
    const result = await bridgesLayer.queryFeatures(query);
    return result.features.map(f => featureToObject<Bridge>(f));
  }

  static async getBridgesByRoute(route: number, dir?: string): Promise<Bridge[]> {
    const query = bridgesLayer.createQuery();
    query.where = dir 
      ? `route = ${route} AND dir = '${dir}'`
      : `route = ${route}`;
    const result = await bridgesLayer.queryFeatures(query);
    return result.features.map(f => featureToObject<Bridge>(f));
  }
}

// Maintenance Limits Operations
export class AGOLMaintLimitsService {
  static async getAllMaintLimits(): Promise<MaintLimitConstruct[]> {
    const query = maintLimitsLayer.createQuery();
    query.where = "1=1";
    const result = await maintLimitsLayer.queryFeatures(query);
    return result.features.map(f => featureToObject<MaintLimitConstruct>(f));
  }

  static async getMaintLimitsByRoute(route: number, dir?: string): Promise<MaintLimitConstruct[]> {
    const query = maintLimitsLayer.createQuery();
    query.where = dir 
      ? `route = ${route} AND dir = '${dir}'`
      : `route = ${route}`;
    const result = await maintLimitsLayer.queryFeatures(query);
    return result.features.map(f => featureToObject<MaintLimitConstruct>(f));
  }
}

// Sample Points Operations
export class AGOLSamplePointsService {
  static async getAllSamplePoints(): Promise<SamplePoints[]> {
    const query = samplePointsLayer.createQuery();
    query.where = "1=1";
    const result = await samplePointsLayer.queryFeatures(query);
    return result.features.map(f => featureToObject<SamplePoints>(f));
  }

  static async getSamplePointsByRoute(route: number, dir?: string): Promise<SamplePoints[]> {
    const query = samplePointsLayer.createQuery();
    query.where = dir 
      ? `route = ${route} AND dir = '${dir}'`
      : `route = ${route}`;
    const result = await samplePointsLayer.queryFeatures(query);
    return result.features.map(f => featureToObject<SamplePoints>(f));
  }

  static async updateSamplePoints(route: number, dir: string, noOfPoints: number): Promise<void> {
    const query = randomSelectionsLayer.createQuery();
    query.where = `route = ${route} AND dir = '${dir}'`;
    const result = await samplePointsLayer.queryFeatures(query);
    
    if (result.features.length > 0) {
      const feature = result.features[0];
      feature.attributes.noOfPoints = noOfPoints;
      await samplePointsLayer.applyEdits({
        updateFeatures: [feature]
      });
    }
  }
}

// Random Selections Operations
export class AGOLRandomSelectionsService {
  static async getAllRandomSelections(): Promise<RandomSelection[]> {
    const query = randomSelectionsLayer.createQuery();
    query.where = "1=1";
    const result = await randomSelectionsLayer.queryFeatures(query);
    return result.features.map(f => featureToObject<RandomSelection>(f));
  }

  static async addRandomSelection(selection: Omit<RandomSelection, 'id'>): Promise<RandomSelection> {
    const graphic = new Graphic({
      attributes: selection
    });

    const result = await randomSelectionsLayer.applyEdits({
      addFeatures: [graphic]
    });

    if (result.addFeatureResults?.[0]?.objectId) {
      return {
        id: result.addFeatureResults[0].objectId,
        ...selection
      } as RandomSelection;
    }
    throw new Error("Failed to add random selection");
  }

  static async clearRandomSelections(): Promise<void> {
    const query = randomSelectionsLayer.createQuery();
    query.where = "1=1";
    const result = await randomSelectionsLayer.queryFeatures(query);
    
    if (result.features.length > 0) {
      await randomSelectionsLayer.applyEdits({
        deleteFeatures: result.features
      });
    }
  }
}

// Generation Config Operations
export class AGOLGenerationConfigService {
  static async getGenerationConfig(): Promise<GenerationConfig> {
    const query = generationConfigLayer.createQuery();
    query.where = "1=1";
    const result = await generationConfigLayer.queryFeatures(query);
    
    if (result.features.length > 0) {
      return featureToObject<GenerationConfig>(result.features[0]);
    }
    
    // Return default config if none exists
    return {
      id: 1,
      systemType: "centerline",
      increment: 0.1,
      inspectionLength: 264,
      excludeBridgeSections: false,
      excludeBridgePoints: true,
      altPoints: 3,
    };
  }

  static async updateGenerationConfig(config: Partial<GenerationConfig>): Promise<GenerationConfig> {
    const query = generationConfigLayer.createQuery();
    query.where = "1=1";
    const result = await generationConfigLayer.queryFeatures(query);
    
    if (result.features.length > 0) {
      const feature = result.features[0];
      Object.assign(feature.attributes, config);
      
      await generationConfigLayer.applyEdits({
        updateFeatures: [feature]
      });
      
      return featureToObject<GenerationConfig>(feature);
    }
    
    // Create new config if none exists
    const graphic = new Graphic({
      attributes: { id: 1, ...config }
    });

    const addResult = await generationConfigLayer.applyEdits({
      addFeatures: [graphic]
    });

    if (addResult.addFeatureResults?.[0]?.success) {
      return {
        id: addResult.addFeatureResults[0].objectId,
        ...config
      } as GenerationConfig;
    }
    
    throw new Error("Failed to update generation config");
  }
}

// Historical Reports Operations
export class AGOLHistoricalReportsService {
  static async getHistoricalReports(): Promise<HistoricalReport[]> {
    const query = historicalReportsLayer.createQuery();
    query.where = "1=1";
    query.orderByFields = ["generatedAt DESC"];
    const result = await historicalReportsLayer.queryFeatures(query);
    return result.features.map(f => featureToObject<HistoricalReport>(f));
  }

  static async getHistoricalReport(id: number): Promise<HistoricalReport | undefined> {
    const query = historicalReportsLayer.createQuery();
    query.where = `OBJECTID = ${id}`;
    const result = await historicalReportsLayer.queryFeatures(query);
    
    if (result.features.length > 0) {
      return featureToObject<HistoricalReport>(result.features[0]);
    }
    return undefined;
  }

  static async addHistoricalReport(report: Omit<HistoricalReport, 'id'>): Promise<HistoricalReport> {
    const graphic = new Graphic({
      attributes: {
        ...report,
        generatedAt: new Date().toISOString()
      }
    });

    const result = await historicalReportsLayer.applyEdits({
      addFeatures: [graphic]
    });

    if (result.addFeatureResults?.[0]?.objectId) {
      return {
        id: result.addFeatureResults[0].objectId,
        generatedAt: new Date().toISOString(),
        ...report
      } as HistoricalReport;
    }
    throw new Error("Failed to add historical report");
  }
}

// Initialize the AGOL client
export function initializeAGOL() {
  // This will be called when the app starts
  // URLs will be configured after feature services are published
  initializeAGOLLayers();
}