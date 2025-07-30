import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  current: number;
  total: number;
  message: string;
  currentRoute: string;
}

export default function ProgressTracker({ current, total, message, currentRoute }: ProgressTrackerProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-navy-800">Generation Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{message}</span>
          <span className="text-navy-600 font-medium">{percentage}%</span>
        </div>
        <Progress value={percentage} className="w-full h-3" />
        {currentRoute && (
          <div className="text-xs text-gray-500">Current: {currentRoute}</div>
        )}
      </CardContent>
    </Card>
  );
}
