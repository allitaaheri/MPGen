import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface GenerationConfig {
  systemType: "directional" | "centerline";
  increment: number;
  inspectionLength: number;
  excludeBridgeSections: boolean;
  excludeBridgePoints: boolean;
  altPoints: number;
}

interface SystemConfigFormProps {
  config: GenerationConfig;
  onChange: (config: GenerationConfig) => void;
}

export default function SystemConfigForm({ config, onChange }: SystemConfigFormProps) {
  const updateConfig = (updates: Partial<GenerationConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* System Type */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">System Type</Label>
        <RadioGroup
          value={config.systemType}
          onValueChange={(value: "directional" | "centerline") => updateConfig({ systemType: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="directional" id="directional" />
            <Label htmlFor="directional" className="text-sm text-gray-700">
              Directional
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="centerline" id="centerline" />
            <Label htmlFor="centerline" className="text-sm text-gray-700">
              Centerline
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Point Generation Settings */}
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Create Random Points every
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={config.increment}
              onChange={(e) => updateConfig({ increment: parseFloat(e.target.value) || 0.1 })}
              step="0.001"
              min="0.001"
              className="w-20 text-sm focus:ring-navy-500 focus:border-navy-500"
            />
            <span className="text-sm text-gray-600">Miles</span>
          </div>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Length of Inspection
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={config.inspectionLength}
              onChange={(e) => updateConfig({ inspectionLength: parseInt(e.target.value) || 264 })}
              min="1"
              className="w-20 text-sm focus:ring-navy-500 focus:border-navy-500"
            />
            <span className="text-sm text-gray-600">Feet</span>
          </div>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1"># of Alt Points</Label>
          <Input
            type="number"
            value={config.altPoints}
            onChange={(e) => updateConfig({ altPoints: parseInt(e.target.value) || 0 })}
            min="0"
            max="10"
            className="w-16 text-sm focus:ring-navy-500 focus:border-navy-500"
          />
          <p className="text-xs text-gray-500 mt-1">Alternative inspection points per route</p>
        </div>
      </div>

      {/* Bridge Handling */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-3">Bridge Handling</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="excludeBridgeSections"
              checked={config.excludeBridgeSections}
              onCheckedChange={(checked) => updateConfig({ excludeBridgeSections: !!checked })}
              className="focus:ring-navy-500"
            />
            <Label htmlFor="excludeBridgeSections" className="text-sm text-gray-700">
              Exclude Sample Sections on Bridges
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="excludeBridgePoints"
              checked={config.excludeBridgePoints}
              onCheckedChange={(checked) => updateConfig({ excludeBridgePoints: !!checked })}
              className="focus:ring-navy-500"
            />
            <Label htmlFor="excludeBridgePoints" className="text-sm text-gray-700">
              Exclude Points on Bridges
            </Label>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Buffer area consideration: {Math.round(config.inspectionLength / 2)} ft. (1/2 Inspection Length)
        </p>
      </div>
    </div>
  );
}