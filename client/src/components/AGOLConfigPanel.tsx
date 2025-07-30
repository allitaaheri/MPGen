import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AGOL_CONFIG } from "@/lib/agolClient";

interface AGOLConfigPanelProps {
  onConfigUpdate: (config: typeof AGOL_CONFIG) => void;
}

export function AGOLConfigPanel({ onConfigUpdate }: AGOLConfigPanelProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState(AGOL_CONFIG);

  const handleSave = () => {
    // Validate URLs
    const requiredUrls = [
      'ROUTES_SERVICE_URL',
      'BRIDGES_SERVICE_URL', 
      'MAINT_LIMITS_SERVICE_URL',
      'SAMPLE_POINTS_SERVICE_URL',
      'RANDOM_SELECTIONS_SERVICE_URL',
      'GENERATION_CONFIG_SERVICE_URL',
      'HISTORICAL_REPORTS_SERVICE_URL'
    ] as const;

    const missingUrls = requiredUrls.filter(key => !config[key]);
    
    if (missingUrls.length > 0) {
      toast({
        title: "Configuration Incomplete",
        description: `Please provide URLs for: ${missingUrls.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    onConfigUpdate(config);
    toast({
      title: "Configuration Saved",
      description: "AGOL feature service URLs have been updated successfully."
    });
  };

  const handleUrlChange = (key: keyof typeof AGOL_CONFIG, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">AGOL Configuration</CardTitle>
        <CardDescription className="text-center">
          Configure your ArcGIS Online feature service URLs for deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="routes-url">Routes Service URL</Label>
            <Input
              id="routes-url"
              placeholder="https://services.arcgis.com/[YOUR_ORG]/arcgis/rest/services/RMG_Routes/FeatureServer/0"
              value={config.ROUTES_SERVICE_URL}
              onChange={(e) => handleUrlChange('ROUTES_SERVICE_URL', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bridges-url">Bridges Service URL</Label>
            <Input
              id="bridges-url"
              placeholder="https://services.arcgis.com/[YOUR_ORG]/arcgis/rest/services/RMG_Bridges/FeatureServer/0"
              value={config.BRIDGES_SERVICE_URL}
              onChange={(e) => handleUrlChange('BRIDGES_SERVICE_URL', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maint-limits-url">Maintenance Limits Service URL</Label>
            <Input
              id="maint-limits-url"
              placeholder="https://services.arcgis.com/[YOUR_ORG]/arcgis/rest/services/RMG_MaintLimits/FeatureServer/0"
              value={config.MAINT_LIMITS_SERVICE_URL}
              onChange={(e) => handleUrlChange('MAINT_LIMITS_SERVICE_URL', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sample-points-url">Sample Points Service URL</Label>
            <Input
              id="sample-points-url"
              placeholder="https://services.arcgis.com/[YOUR_ORG]/arcgis/rest/services/RMG_SamplePoints/FeatureServer/0"
              value={config.SAMPLE_POINTS_SERVICE_URL}
              onChange={(e) => handleUrlChange('SAMPLE_POINTS_SERVICE_URL', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="random-selections-url">Random Selections Service URL</Label>
            <Input
              id="random-selections-url"
              placeholder="https://services.arcgis.com/[YOUR_ORG]/arcgis/rest/services/RMG_RandomSelections/FeatureServer/0"
              value={config.RANDOM_SELECTIONS_SERVICE_URL}
              onChange={(e) => handleUrlChange('RANDOM_SELECTIONS_SERVICE_URL', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="generation-config-url">Generation Config Service URL</Label>
            <Input
              id="generation-config-url"
              placeholder="https://services.arcgis.com/[YOUR_ORG]/arcgis/rest/services/RMG_Config/FeatureServer/0"
              value={config.GENERATION_CONFIG_SERVICE_URL}
              onChange={(e) => handleUrlChange('GENERATION_CONFIG_SERVICE_URL', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="historical-reports-url">Historical Reports Service URL</Label>
            <Input
              id="historical-reports-url"
              placeholder="https://services.arcgis.com/[YOUR_ORG]/arcgis/rest/services/RMG_Reports/FeatureServer/0"
              value={config.HISTORICAL_REPORTS_SERVICE_URL}
              onChange={(e) => handleUrlChange('HISTORICAL_REPORTS_SERVICE_URL', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portal-url">Portal URL</Label>
              <Input
                id="portal-url"
                value={config.PORTAL_URL}
                onChange={(e) => handleUrlChange('PORTAL_URL', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-id">Application ID</Label>
              <Input
                id="app-id"
                placeholder="Your registered AGOL application ID"
                value={config.APP_ID}
                onChange={(e) => handleUrlChange('APP_ID', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Setup Instructions:
          </h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Create feature services in your ArcGIS Online organization</li>
            <li>Populate them with your route, bridge, and constraint data</li>
            <li>Register your application for authentication</li>
            <li>Copy the feature service URLs above</li>
            <li>Click Save Configuration to apply settings</li>
          </ol>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleSave} className="bg-[#2D68C4] hover:bg-[#1e4a8c] text-white">
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}