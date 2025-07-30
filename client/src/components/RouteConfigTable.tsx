import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Route } from "lucide-react";

interface RouteConfig {
  sr: number;
  mainPoints: number;
  enabled: boolean;
}

interface RouteConfigTableProps {
  routeConfigs: RouteConfig[];
  onChange: (configs: RouteConfig[]) => void;
}

export default function RouteConfigTable({ routeConfigs, onChange }: RouteConfigTableProps) {
  const updateRouteConfig = (sr: number, updates: Partial<RouteConfig>) => {
    const updatedConfigs = routeConfigs.map(config =>
      config.sr === sr ? { ...config, ...updates } : config
    );
    onChange(updatedConfigs);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-medium text-gray-700">Route</th>
            <th className="text-left py-2 px-3 font-medium text-gray-700">Main Points</th>
            <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {routeConfigs.map((config) => (
            <tr key={config.sr} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-3 font-medium text-gray-900">
                <div className="flex items-center space-x-2">
                  <Route className="w-4 h-4 text-navy-600" />
                  <span>SR {config.sr}</span>
                </div>
              </td>
              <td className="py-3 px-3">
                <Input
                  type="number"
                  value={config.mainPoints}
                  onChange={(e) => updateRouteConfig(config.sr, { mainPoints: parseInt(e.target.value) || 1 })}
                  min="1"
                  disabled={!config.enabled}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-navy-500 focus:border-navy-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center justify-between w-full">
                  <Switch
                    id={`route-${config.sr}`}
                    checked={config.enabled}
                    onCheckedChange={(enabled) => updateRouteConfig(config.sr, { enabled })}
                    className={`focus:ring-navy-500 ${config.enabled ? 'switch-enabled' : ''}`}
                  />
                  <Label 
                    htmlFor={`route-${config.sr}`} 
                    className={`text-sm ${config.enabled ? 'text-status-enabled-navy font-medium' : 'text-status-disabled'}`}
                  >
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </Label>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
