import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, MapPin, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { mapController } from "@/lib/mapController";

interface HistoricalReport {
  id: number;
  title: string;
  generatedDate: string;
  totalPoints: number;
  reportData: string;
}

export default function MapControlsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [layerVisibility, setLayerVisibility] = useState<Record<number, boolean>>({});

  // Fetch historical reports
  const { data: historicalReports = [] } = useQuery<HistoricalReport[]>({
    queryKey: ["/api/historical-reports"],
  });

  // Clear all map layers mutation
  const clearMapLayersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/results");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/historical-reports"] });
      setLayerVisibility({});
      toast({
        title: "Map Cleared",
        description: "All inspection points removed from map.",
      });
      // Clear all layers via the map controller
      mapController.clearAllLayers();
    },
  });

  // Clear all historical reports mutation
  const clearAllReportsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/historical-reports");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/historical-reports"] });
      toast({
        title: "Reports Cleared",
        description: "All historical reports have been deleted.",
      });
    },
  });

  // Delete individual report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      const response = await apiRequest("DELETE", `/api/historical-reports/${reportId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/historical-reports"] });
      toast({
        title: "Report Deleted",
        description: "Historical report has been removed.",
      });
    },
  });

  const toggleLayerVisibility = (reportId: number) => {
    const newVisibility = !layerVisibility[reportId];
    setLayerVisibility(prev => ({
      ...prev,
      [reportId]: newVisibility
    }));

    // Actually control the map layers
    mapController.toggleLayer(reportId, newVisibility);
  };

  // Initialize visibility state for new reports
  useEffect(() => {
    const newVisibility: Record<number, boolean> = {};
    historicalReports.forEach(report => {
      if (!(report.id in layerVisibility)) {
        newVisibility[report.id] = true; // Default to visible
      }
    });
    
    if (Object.keys(newVisibility).length > 0) {
      setLayerVisibility(prev => ({ ...prev, ...newVisibility }));
    }
  }, [historicalReports, layerVisibility]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-navy-800 border-b border-gray-200 pb-2 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Map Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Layer Visibility Controls */}
        {historicalReports.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Inspection Point Layers
            </h4>
            {historicalReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <Switch
                    id={`layer-${report.id}`}
                    checked={layerVisibility[report.id] ?? true}
                    onCheckedChange={() => toggleLayerVisibility(report.id)}
                  />
                  <Label htmlFor={`layer-${report.id}`} className="text-sm">
                    {report.title}
                  </Label>
                  <span className="text-xs text-gray-500">
                    ({report.totalPoints} points)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteReportMutation.mutate(report.id)}
                  disabled={deleteReportMutation.isPending}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        <div className="border-t pt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Bulk Actions</h4>
          
          <Button
            onClick={() => clearMapLayersMutation.mutate()}
            disabled={clearMapLayersMutation.isPending}
            variant="outline"
            size="sm"
            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {clearMapLayersMutation.isPending ? "Clearing..." : "Clear Map Layers"}
          </Button>

          {historicalReports.length > 0 && (
            <Button
              onClick={() => clearAllReportsMutation.mutate()}
              disabled={clearAllReportsMutation.isPending}
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {clearAllReportsMutation.isPending ? "Deleting..." : "Delete All Reports"}
            </Button>
          )}
        </div>

        {/* Layer Information */}
        {historicalReports.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No inspection layers available</p>
            <p className="text-xs">Generate points to create map layers</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}