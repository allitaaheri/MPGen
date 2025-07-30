import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { agolStorage, ClientRandomPointGenerator } from "./agolAdapter";
import type { GeneratePointsRequest } from "@shared/schema";

// Custom query function for AGOL operations
export const getAGOLQueryFn: QueryFunction = async ({ queryKey }) => {
  const [, endpoint, ...params] = queryKey as string[];
  
  switch (endpoint) {
    case "routes":
      return agolStorage.getAllRoutes();
    
    case "bridges":
      return agolStorage.getAllBridges();
    
    case "maint-limits":
      return agolStorage.getAllMaintLimits();
    
    case "sample-points":
      return agolStorage.getAllSamplePoints();
    
    case "results":
      return agolStorage.getAllRandomSelections();
    
    case "config":
      return agolStorage.getGenerationConfig();
    
    case "historical-reports":
      if (params[0]) {
        return agolStorage.getHistoricalReport(parseInt(params[0]));
      }
      return agolStorage.getHistoricalReports();
    
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
};

// Custom mutation functions for AGOL operations
export async function agolMutation(
  method: string,
  endpoint: string,
  data?: unknown
): Promise<any> {
  switch (method) {
    case "POST":
      if (endpoint === "generate") {
        const config = data as GeneratePointsRequest;
        return ClientRandomPointGenerator.generateRandomPoints(config);
      }
      if (endpoint === "historical-reports") {
        return agolStorage.addHistoricalReport(data as any);
      }
      break;
    
    case "PUT":
      if (endpoint === "config") {
        return agolStorage.updateGenerationConfig(data as any);
      }
      break;
    
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

export const agolQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getAGOLQueryFn,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});