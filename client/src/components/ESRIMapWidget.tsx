import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import Polyline from "@arcgis/core/geometry/Polyline";
import Point from "@arcgis/core/geometry/Point";
import { mapController } from "@/lib/mapController";

interface RandomSelection {
  id: number;
  route: number;
  dir: string;
  milepost: number;
  selType: string;
}

interface RouteData {
  routes: Array<{
    id: number;
    sr: number;
    dir: string | null;
    beg: number;
    end: number;
  }>;
}

interface ESRIMapWidgetProps {
  results?: RandomSelection[];
  routeData?: RouteData;
  className?: string;
}

// Approximate coordinates for Florida state routes (SR 112, 836, 874, 878, 924)
const ROUTE_COORDINATES = {
  112: { // SR 112 (Airport Expressway)
    start: [-80.2781, 25.7931], // Near Miami International Airport
    end: [-80.1918, 25.7931],
    center: [-80.235, 25.7931]
  },
  836: { // SR 836 (Dolphin Expressway)
    start: [-80.4169, 25.7753],
    end: [-80.1918, 25.7753],
    center: [-80.304, 25.7753]
  },
  874: { // SR 874 (Don Shula Expressway)
    start: [-80.3144, 25.6893],
    end: [-80.2781, 25.7408],
    center: [-80.296, 25.715]
  },
  878: { // SR 878 (Snapper Creek Expressway)
    start: [-80.3144, 25.6893],
    end: [-80.2410, 25.6893],
    center: [-80.278, 25.6893]
  },
  924: { // SR 924 (Gratigny Parkway)
    start: [-80.2781, 25.6435],
    end: [-80.1918, 25.6435],
    center: [-80.235, 25.6435]
  }
};

export default function ESRIMapWidget({ results = [], routeData, className = "" }: ESRIMapWidgetProps) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapView = useRef<MapView | null>(null);
  const graphicsLayer = useRef<GraphicsLayer | null>(null);
  const allLayersRef = useRef(new Map<string, GraphicsLayer>());

  // Initialize map
  useEffect(() => {
    if (!mapDiv.current) return;

    let mounted = true;

    // Create map with satellite imagery basemap
    const map = new Map({
      basemap: "satellite" // ESRI satellite imagery
    });

    // Create graphics layer for routes
    graphicsLayer.current = new GraphicsLayer({
      title: "Highway Routes"
    });
    map.add(graphicsLayer.current);

    // Create map view centered on Miami-Dade area
    mapView.current = new MapView({
      container: mapDiv.current,
      map: map,
      center: [-80.304, 25.7157], // Miami-Dade County center
      zoom: 11,
      ui: {
        components: ["attribution", "zoom"] // Minimal UI for clean integration
      }
    });

    // Wait for view to be ready
    mapView.current.when(() => {
      if (mounted) {
        console.log("ESRI Map initialized successfully");
        // Register the map view with the controller
        mapController.setMapView(mapView.current);
      }
    }).catch((error) => {
      if (mounted) {
        console.warn("ESRI Map initialization warning:", error);
      }
    });

    return () => {
      mounted = false;
      if (mapView.current) {
        mapView.current.destroy();
        mapView.current = null;
      }
    };
  }, []);

  // Update route graphics when routeData changes
  useEffect(() => {
    if (!mapView.current || !graphicsLayer.current || !routeData) return;
    
    // Wait for map view to be ready before updating graphics
    mapView.current.when(() => {
      if (!mapView.current || !graphicsLayer.current || !routeData) return;

      // Clear existing route graphics
      graphicsLayer.current.removeAll();

      // Add route lines
      routeData.routes.forEach(route => {
        const coords = ROUTE_COORDINATES[route.sr as keyof typeof ROUTE_COORDINATES];
        if (!coords) return;

        // Create route polyline
        const routeLine = new Polyline({
          paths: [[coords.start, coords.end]],
          spatialReference: { wkid: 4326 }
        });

        // Route line symbol
        const lineSymbol = new SimpleLineSymbol({
          color: "#2D68C4", // Royal blue matching app header
          width: 4,
          style: "solid"
        });

        // Create route graphic
        const routeGraphic = new Graphic({
          geometry: routeLine,
          symbol: lineSymbol,
          attributes: {
            name: `SR ${route.sr}`,
            direction: route.dir,
            beginMP: route.beg,
            endMP: route.end
          },
          popupTemplate: {
            title: "State Route {name}",
            content: [
              {
                type: "fields",
                fieldInfos: [
                  { fieldName: "direction", label: "Direction" },
                  { fieldName: "beginMP", label: "Begin Milepost", format: { places: 1 } },
                  { fieldName: "endMP", label: "End Milepost", format: { places: 1 } }
                ]
              }
            ]
          }
        });

        graphicsLayer.current!.add(routeGraphic);
      });
    }).catch((error) => {
      console.warn("Map update error:", error);
    });

  }, [results, routeData]);

  // Update inspection points when results change - separate from route graphics
  useEffect(() => {
    if (!mapView.current || !results.length) return;

    // Create a unique layer for this generation
    const reportId = Date.now();
    const layerTitle = `Inspection Points - ${new Date().toLocaleTimeString()}`;
    const pointsLayer = new GraphicsLayer({
      title: layerTitle,
      visible: true,
      id: `layer_${reportId}`
    });

    // Wait for map view to be ready before adding inspection points
    mapView.current.when(() => {
      if (!mapView.current) return;

      // Add layer to map
      if (mapView.current.map) {
        mapView.current.map.add(pointsLayer);
      }

      // Register layer with the controller for visibility management
      mapController.registerLayer(reportId, pointsLayer);

      // Store layer reference
      allLayersRef.current.set(`layer_${reportId}`, pointsLayer);

      // Add inspection points to the new layer
      results.forEach(point => {
        const coords = ROUTE_COORDINATES[point.route as keyof typeof ROUTE_COORDINATES];
        if (!coords) return;

        // Calculate approximate position along route based on milepost
        const routeInfo = routeData?.routes.find(r => r.sr === point.route);
        if (!routeInfo) return;

        const totalDistance = routeInfo.end - routeInfo.beg;
        const pointDistance = point.milepost - routeInfo.beg;
        const ratio = totalDistance > 0 ? pointDistance / totalDistance : 0;

        // Interpolate coordinates
        const lng = coords.start[0] + (coords.end[0] - coords.start[0]) * ratio;
        const lat = coords.start[1] + (coords.end[1] - coords.start[1]) * ratio;

        // Point geometry
        const pointGeometry = new Point({
          longitude: lng,
          latitude: lat,
          spatialReference: { wkid: 4326 }
        });

        // Point symbol based on selection type
        const isMainPoint = point.selType === "Main";
        const pointSymbol = new SimpleMarkerSymbol({
          color: isMainPoint ? "#9F1717" : "#2E6F40",
          size: isMainPoint ? 12 : 8,
          style: "circle",
          outline: {
            color: "white",
            width: 2
          }
        });

        // Create point graphic
        const pointGraphic = new Graphic({
          geometry: pointGeometry,
          symbol: pointSymbol,
          attributes: {
            route: `SR ${point.route}`,
            milepost: point.milepost,
            type: point.selType,
            direction: point.dir
          },
          popupTemplate: {
            title: "Inspection Point",
            content: [
              {
                type: "fields",
                fieldInfos: [
                  { fieldName: "route", label: "Route" },
                  { fieldName: "milepost", label: "Milepost", format: { places: 1 } },
                  { fieldName: "type", label: "Point Type" },
                  { fieldName: "direction", label: "Direction" }
                ]
              }
            ]
          }
        });

        pointsLayer.add(pointGraphic);
      });
    }).catch((error) => {
      console.warn("Map points update error:", error);
    });

  }, [results]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapDiv} 
        className="w-full h-full bg-gray-100 rounded-lg overflow-hidden"
        style={{ minHeight: "400px" }}
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-[#2D68C4] rounded"></div>
            <span className="text-gray-700">Highway Routes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#9F1717] rounded-full border border-white"></div>
            <span className="text-gray-700">Main Points</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#2E6F40] rounded-full border border-white"></div>
            <span className="text-gray-700">Alt Points</span>
          </div>
        </div>
      </div>

      {/* Loading overlay when no data */}
      {(!results || results.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm rounded-lg">
          <div className="text-center text-gray-600">
            <div className="text-lg font-medium mb-2">ESRI Satellite Map</div>
            <div className="text-sm">Generate inspection points to view on map</div>
          </div>
        </div>
      )}
    </div>
  );
}