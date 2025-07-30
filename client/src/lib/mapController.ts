// Global map controller for managing layer visibility
let mapViewRef: any = null;
let layerRegistry: Map<number, any> = new Map();

export const mapController = {
  // Register the map view reference
  setMapView: (mapView: any) => {
    mapViewRef = mapView;
  },

  // Register a layer with a report ID
  registerLayer: (reportId: number, layer: any) => {
    layerRegistry.set(reportId, layer);
  },

  // Toggle layer visibility by report ID
  toggleLayer: (reportId: number, visible: boolean) => {
    // Try to find layer by report ID first
    let layer = layerRegistry.get(reportId);
    
    // If not found, try to find by title pattern (for existing layers)
    if (!layer && mapViewRef && mapViewRef.map) {
      mapViewRef.map.allLayers.forEach((mapLayer: any) => {
        if (mapLayer.title && mapLayer.title.includes('Inspection Points')) {
          layer = mapLayer;
        }
      });
    }
    
    if (layer) {
      layer.visible = visible;
    }
  },

  // Clear all layers
  clearAllLayers: () => {
    if (mapViewRef && mapViewRef.map) {
      layerRegistry.forEach((layer) => {
        mapViewRef.map.remove(layer);
      });
      layerRegistry.clear();
    }
  },

  // Get layer visibility
  getLayerVisibility: (reportId: number): boolean => {
    const layer = layerRegistry.get(reportId);
    return layer ? layer.visible : false;
  }
};