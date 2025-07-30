import { Badge } from "@/components/ui/badge";

interface RandomSelection {
  id: number;
  route: number;
  dir: string;
  milepost: number;
  selType: string;
}

interface ResultsTableProps {
  results: RandomSelection[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  let currentRoute = '';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">No.</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Route</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Dir</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">SelType</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">MilePost</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => {
            const routeDisplay = result.route.toString() !== currentRoute ? result.route.toString() : '';
            currentRoute = result.route.toString();
            
            return (
              <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4 font-medium">{routeDisplay}</td>
                <td className="py-2 px-4">{result.dir}</td>
                <td className="py-2 px-4">
                  <Badge
                    className={
                      result.selType === 'Main'
                        ? 'bg-navy-100 text-navy-800 hover:bg-navy-200'
                        : 'bg-forest-100 text-forest-800 hover:bg-forest-200'
                    }
                  >
                    {result.selType}
                  </Badge>
                </td>
                <td className="py-2 px-4">{result.milepost.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
