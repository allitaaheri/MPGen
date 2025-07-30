import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, FileText, BarChart3 } from "lucide-react";

interface ActionPanelProps {
  onGenerate: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  isGenerating: boolean;
  hasResults: boolean;
  totalRoutes: number;
  totalMainPoints: number;
  totalAltPoints: number;
  totalPoints: number;
}

export default function ActionPanel({
  onGenerate,
  onExportPDF,
  onExportExcel,
  isGenerating,
  hasResults,
  totalRoutes,
  totalMainPoints,
  totalAltPoints,
  totalPoints,
}: ActionPanelProps) {
  return (
    <>
      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy-800">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full bg-navy-600 text-white hover:bg-navy-700 focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Random Points"}
          </Button>
          
          <Button
            onClick={onExportPDF}
            disabled={!hasResults}
            className="w-full bg-pdf-red text-white hover:bg-pdf-red focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report (PDF)
          </Button>
          
          <Button
            onClick={onExportExcel}
            disabled={!hasResults}
            className="w-full bg-olive-green text-white hover:bg-olive-green disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy-800">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Routes:</span>
            <span className="font-medium">{totalRoutes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Main Points:</span>
            <span className="font-medium">{totalMainPoints}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Alt Points:</span>
            <span className="font-medium">{totalAltPoints}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-600 font-medium">Total Points:</span>
            <span className="font-semibold text-navy-800">{totalPoints}</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
