import { useState } from "react";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ESRIMapWidget from "@/components/ESRIMapWidget";
import MapControlsPanel from "@/components/MapControlsPanel";
import { MapProvider } from "@/contexts/MapContext";
import SystemConfigForm from "@/components/SystemConfigForm";
import RouteConfigTable from "@/components/RouteConfigTable";
import ActionPanel from "@/components/ActionPanel";
import ResultsTable from "@/components/ResultsTable";
import ProgressTracker from "@/components/ProgressTracker";
import HistoricalReports from "@/components/HistoricalReports";
import { Footer } from "@/components/Footer";
import { FileText, BarChart3 } from "lucide-react";

interface RouteData {
  routes: Array<{
    id: number;
    sr: number;
    dir: string;
    beg: number;
    end: number;
  }>;
  samplePoints: Array<{
    id: number;
    route: number;
    dir: string | null;
    noOfPoints: number;
  }>;
}

interface GenerationConfig {
  systemType: "directional" | "centerline";
  increment: number;
  inspectionLength: number;
  excludeBridgeSections: boolean;
  excludeBridgePoints: boolean;
  altPoints: number;
}

interface RandomSelection {
  id: number;
  route: number;
  dir: string;
  milepost: number;
  selType: string;
}

export default function RandomMilepostGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<GenerationConfig>({
    systemType: "centerline",
    increment: 0.1,
    inspectionLength: 264,
    excludeBridgeSections: false,
    excludeBridgePoints: true,
    altPoints: 3,
  });

  const [routeConfigs, setRouteConfigs] = useState<Array<{ sr: number; mainPoints: number; enabled: boolean }>>([
    { sr: 112, mainPoints: 11, enabled: true },
    { sr: 836, mainPoints: 25, enabled: true },
    { sr: 874, mainPoints: 18, enabled: true },
    { sr: 878, mainPoints: 7, enabled: true },
    { sr: 924, mainPoints: 14, enabled: true },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: "", route: "" });

  // Fetch routes and sample points
  const { data: routeData, isLoading: routesLoading } = useQuery<RouteData>({
    queryKey: ["/api/routes"],
  });

  // Fetch generated results
  const { data: results, isLoading: resultsLoading } = useQuery<RandomSelection[]>({
    queryKey: ["/api/results"],
  });

  // Generate random points mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const enabledRoutes = routeConfigs.filter(route => route.enabled);
      const response = await apiRequest("POST", "/api/generate", {
        ...config,
        routes: enabledRoutes,
      });
      return response.json();
    },
    onMutate: () => {
      setIsGenerating(true);
      setProgress({ current: 0, total: routeConfigs.length, message: "Initializing...", route: "" });
    },
    onSuccess: (data) => {
      toast({
        title: "Generation Complete",
        description: `Generated ${data.results.length} random points successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/historical-reports"] });
      setIsGenerating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate random points",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  // Clear results mutation
  const clearResultsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/results"),
    onSuccess: () => {
      toast({
        title: "Results Cleared",
        description: "All generated points have been cleared.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
  });

  // Export mutations
  const exportPDFMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/export/pdf");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "RandomPointReport.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "PDF Downloaded",
        description: "Random point report has been downloaded.",
      });
    },
  });

  const exportExcelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/export/excel");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "RandomSelections.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Excel Downloaded",
        description: "Random selections have been exported to Excel.",
      });
    },
  });

  const handleGenerate = () => {
    // Simulate progress updates (in a real app, this would come from WebSocket or SSE)
    generateMutation.mutate();
    
    // Mock progress updates
    let step = 0;
    const progressInterval = setInterval(() => {
      if (step < routeConfigs.length) {
        setProgress({
          current: step + 1,
          total: routeConfigs.length,
          message: `Processing SR ${routeConfigs[step].sr}...`,
          route: `SR ${routeConfigs[step].sr}`,
        });
        step++;
      } else {
        clearInterval(progressInterval);
      }
    }, 500);
  };

  const enabledRoutes = routeConfigs.filter(route => route.enabled);
  const totalMainPoints = enabledRoutes.reduce((sum, route) => sum + route.mainPoints, 0);
  const totalAltPoints = enabledRoutes.length * config.altPoints;
  const totalPoints = totalMainPoints + totalAltPoints;

  if (routesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading route data...</p>
        </div>
      </div>
    );
  }

  return (
    <MapProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gray-50 pb-4 mb-4">
          <div className="bg-royal-blue px-6 py-4 rounded-lg shadow-lg flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">
              Random Milepost Generator (RMG)
            </h1>
            <img 
              src="https://gmx-way.com/gmx/redesign/images/gmx-logo-header.png" 
              alt="Greater Miami Expressway Agency"
              className="h-12 w-auto"
            />
          </div>
          <p className="text-gray-600">
            Generate random inspection points along routes with customizable constraints
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-6 space-y-6">
            {/* System Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy-800 border-b border-gray-200 pb-2">
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SystemConfigForm config={config} onChange={setConfig} />
              </CardContent>
            </Card>

            {/* Route Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy-800 border-b border-gray-200 pb-2">
                  Route Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RouteConfigTable
                  routeConfigs={routeConfigs}
                  onChange={setRouteConfigs}
                />
              </CardContent>
            </Card>

            {/* ESRI Satellite Map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy-800 border-b border-gray-200 pb-2">
                  Satellite Map View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ESRIMapWidget 
                  results={results}
                  routeData={routeData}
                  className="h-96"
                />
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-4 space-y-6">
            <ActionPanel
              onGenerate={handleGenerate}
              onExportPDF={() => exportPDFMutation.mutate()}
              onExportExcel={() => exportExcelMutation.mutate()}
              isGenerating={isGenerating}
              hasResults={(results?.length || 0) > 0}
              totalRoutes={enabledRoutes.length}
              totalMainPoints={totalMainPoints}
              totalAltPoints={totalAltPoints}
              totalPoints={totalPoints}
            />

            {/* Progress Section */}
            {isGenerating && (
              <ProgressTracker
                current={progress.current}
                total={progress.total}
                message={progress.message}
                currentRoute={progress.route}
              />
            )}

            {/* Historical Reports and Map Controls with proper z-index */}
            <div className="space-y-4 relative z-10">
              <HistoricalReports />
              <MapControlsPanel />
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results && results.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-navy-800">Generated Random Points</CardTitle>
                  <div className="text-sm text-gray-500">
                    Generated on: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResultsTable results={results} />
                
                {/* Results Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={() => exportPDFMutation.mutate()}
                    disabled={exportPDFMutation.isPending}
                    className="bg-pdf-red hover:bg-pdf-red text-white disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {exportPDFMutation.isPending ? "Generating..." : "Download PDF Report"}
                  </Button>
                  <Button
                    onClick={() => exportExcelMutation.mutate()}
                    disabled={exportExcelMutation.isPending}
                    className="bg-olive-green hover:bg-olive-green text-white disabled:opacity-50"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {exportExcelMutation.isPending ? "Generating..." : "Download Excel File"}
                  </Button>
                  <Button
                    onClick={() => clearResultsMutation.mutate()}
                    disabled={clearResultsMutation.isPending}
                    variant="destructive"
                  >
                    Clear Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </MapProvider>
  );
}
