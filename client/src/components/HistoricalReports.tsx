import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Calendar, BarChart3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface HistoricalReport {
  id: number;
  title: string;
  generatedDate: string;
  totalPoints: number;
  mainPoints: number;
  altPoints: number;
  routes: string;
  reportData: string;
}

export default function HistoricalReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: reports = [], isLoading } = useQuery<HistoricalReport[]>({
    queryKey: ['/api/historical-reports'],
  });

  // Delete individual report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      const response = await apiRequest("DELETE", `/api/historical-reports/${reportId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/historical-reports'] });
      toast({
        title: "Report Deleted",
        description: "Historical report has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Parse the reports data
  const parsedReports = reports.map((report: HistoricalReport) => ({
    ...report,
    generatedDate: new Date(report.generatedDate),
    routes: JSON.parse(report.routes),
  }));

  const handleDownloadReport = async (reportId: number, format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/historical-reports/${reportId}/${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.${format === 'excel' ? 'csv' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="sticky top-0 bg-white shadow-lg border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              Historical Reports
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">Loading reports...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border-gray-200">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <CardTitle className="text-lg font-semibold text-gray-900">
            Historical Reports
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-80 pr-4">
          <div className="space-y-4">
            {parsedReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No historical reports yet. Generate some points to create your first report!
              </div>
            ) : (
              parsedReports.map((report: any) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {report.title}
                      </h4>
                      <div className="flex items-center space-x-1 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {report.generatedDate.toLocaleDateString()} at{" "}
                          {report.generatedDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-navy-100 text-navy-800 text-xs ml-2">
                      {report.totalPoints} pts
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-600 mb-3">
                    <span className="mr-4">Main: {report.mainPoints}</span>
                    <span className="mr-4">Alt: {report.altPoints}</span>
                    <span>Routes: {report.routes.length}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {report.routes.map((route: string) => (
                      <Badge
                        key={route}
                        variant="outline"
                        className="text-xs py-0 px-1.5 bg-forest-50 text-forest-700 border-forest-200"
                      >
                        {route}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleDownloadReport(report.id, 'pdf')}
                      size="sm"
                      className="flex-1 bg-pdf-red text-white hover:bg-pdf-red text-xs py-2 h-auto"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => handleDownloadReport(report.id, 'excel')}
                      size="sm"
                      className="flex-1 bg-olive-green text-white hover:bg-olive-green text-xs py-2 h-auto"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Excel
                    </Button>
                    <Button
                      onClick={() => deleteReportMutation.mutate(report.id)}
                      disabled={deleteReportMutation.isPending}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        {parsedReports.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              {parsedReports.length} historical report{parsedReports.length > 1 ? 's' : ''} available
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}