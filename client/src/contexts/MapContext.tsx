import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import type MapView from "@arcgis/core/views/MapView";
import type GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

interface MapLayer {
  id: number;
  title: string;
  layer: GraphicsLayer;
  visible: boolean;
}

interface MapContextType {
  mapView: React.MutableRefObject<MapView | null>;
  layers: Map<number, MapLayer>;
  addLayer: (id: number, title: string, layer: GraphicsLayer) => void;
  removeLayer: (id: number) => void;
  toggleLayerVisibility: (id: number) => void;
  clearAllLayers: () => void;
  getLayerVisibility: (id: number) => boolean;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const mapView = useRef<MapView | null>(null);
  const [layers, setLayers] = useState<Map<number, MapLayer>>(new Map());

  const addLayer = (id: number, title: string, layer: GraphicsLayer) => {
    setLayers(prev => {
      const newLayers = new Map(prev);
      newLayers.set(id, { id, title, layer, visible: true });
      
      // Add to map if mapView is available
      if (mapView.current && mapView.current.map) {
        mapView.current.map.add(layer);
      }
      
      return newLayers;
    });
  };

  const removeLayer = (id: number) => {
    setLayers(prev => {
      const newLayers = new Map(prev);
      const mapLayer = newLayers.get(id);
      
      if (mapLayer && mapView.current && mapView.current.map) {
        mapView.current.map.remove(mapLayer.layer);
      }
      
      newLayers.delete(id);
      return newLayers;
    });
  };

  const toggleLayerVisibility = (id: number) => {
    setLayers(prev => {
      const newLayers = new Map(prev);
      const mapLayer = newLayers.get(id);
      
      if (mapLayer) {
        const newVisible = !mapLayer.visible;
        mapLayer.layer.visible = newVisible;
        newLayers.set(id, { ...mapLayer, visible: newVisible });
      }
      
      return newLayers;
    });
  };

  const clearAllLayers = () => {
    if (mapView.current && mapView.current.map) {
      layers.forEach(mapLayer => {
        if (mapView.current && mapView.current.map) {
          mapView.current.map.remove(mapLayer.layer);
        }
      });
    }
    setLayers(new Map());
  };

  const getLayerVisibility = (id: number): boolean => {
    return layers.get(id)?.visible ?? false;
  };

  return (
    <MapContext.Provider value={{
      mapView,
      layers,
      addLayer,
      removeLayer,
      toggleLayerVisibility,
      clearAllLayers,
      getLayerVisibility
    }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
}