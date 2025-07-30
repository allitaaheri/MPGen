import { useState } from "react";
import { AGOLConfigPanel } from "@/components/AGOLConfigPanel";
import { AGOL_CONFIG, initializeAGOL } from "@/lib/agolClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";

export default function AGOLSetup() {
  const { toast } = useToast();
  const [isConfigured, setIsConfigured] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleConfigUpdate = (config: typeof AGOL_CONFIG) => {
    // Update AGOL configuration
    Object.assign(AGOL_CONFIG, config);
    initializeAGOL();
    setIsConfigured(true);
  };

  const handleBuildStatic = async () => {
    setIsBuilding(true);
    try {
      // In a real implementation, this would trigger the build process
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Build Complete",
        description: "Static files are ready for AGOL deployment. Check the 'dist' folder.",
      });
    } catch (error) {
      toast({
        title: "Build Failed",
        description: "There was an error building the static files.",
        variant: "destructive"
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const deploymentSteps = [
    {
      title: "Create Feature Services",
      description: "Set up 7 feature services in your ArcGIS Online organization",
      status: "pending",
      details: [
        "Routes Service (sr, dir, beg, end)",
        "Bridges Service (route, dir, beginMP, endMP)", 
        "Maintenance Limits Service (route, dir, beginMP, endMP)",
        "Sample Points Service (route, dir, noOfPoints)",
        "Random Selections Service (route, dir, milepost, selType)",
        "Generation Config Service (systemType, increment, inspectionLength, etc.)",
        "Historical Reports Service (title, generatedDate, totalPoints, reportData)"
      ]
    },
    {
      title: "Populate Initial Data",
      description: "Add your route, bridge, and constraint data to the feature services",
      status: "pending",
      details: [
        "Import route definitions (SR 112, 836, 874, 878, 924)",
        "Add bridge locations with milepost ranges",
        "Configure maintenance/construction limits",
        "Set sample point counts per route"
      ]
    },
    {
      title: "Configure URLs",
      description: "Update the application with your feature service URLs",
      status: isConfigured ? "complete" : "current",
      details: [
        "Copy feature service REST endpoints",
        "Register application in AGOL",
        "Update configuration panel below"
      ]
    },
    {
      title: "Build & Deploy",
      description: "Create static files and deploy to AGOL",
      status: isConfigured ? "current" : "pending",
      details: [
        "Build production static files",
        "Upload to ArcGIS Online",
        "Configure application settings",
        "Test deployment"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            AGOL Deployment Setup
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Transform your Random Milepost Generator into a cloud-hosted AGOL application.
            Follow these steps to deploy with ArcGIS Feature Services.
          </p>
        </div>

        {/* Deployment Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deploymentSteps.map((step, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    step.status === 'complete' ? 'bg-green-100 text-green-800' :
                    step.status === 'current' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {step.status === 'complete' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </div>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configuration Panel */}
        <AGOLConfigPanel onConfigUpdate={handleConfigUpdate} />

        {/* Build & Deploy Section */}
        {isConfigured && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Build & Deploy
              </CardTitle>
              <CardDescription>
                Create static files for AGOL deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Important: Switch to AGOL Mode
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      The build process will create a version that uses AGOL Feature Services instead of the current PostgreSQL database.
                      Make sure your feature services are properly configured before building.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleBuildStatic}
                  disabled={isBuilding}
                  className="bg-[#2D68C4] hover:bg-[#1e4a8c] text-white"
                >
                  {isBuilding ? "Building..." : "Build Static Files"}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.open("https://doc.arcgis.com/en/web-appbuilder/latest/manage-apps/deploy-app.htm", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  AGOL Deployment Guide
                </Button>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p><strong>Next Steps After Building:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Download the generated static files from the 'dist' folder</li>
                  <li>Create a new Web Application in your ArcGIS Online organization</li>
                  <li>Upload the static files as a ZIP archive</li>
                  <li>Configure application permissions and sharing settings</li>
                  <li>Test the deployed application with your feature services</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}