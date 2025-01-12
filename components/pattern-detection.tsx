import { useEffect, useState } from 'react';

interface PatternData {
  dayCategory: Record<string, Record<string, number>>;
  topPatterns: Array<{
    day: string;
    category: string;
    count: number;
    percentage: number;
  }>;
}

export default function PatternDetection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<PatternData | null>(null);

  useEffect(() => {
    async function fetchPatterns() {
      try {
        const response = await fetch('/api/navigator-patterns');
        if (!response.ok) {
          throw new Error('Failed to fetch patterns');
        }
        const data = await response.json();
        setPatterns(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load patterns');
      } finally {
        setLoading(false);
      }
    }

    fetchPatterns();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <h3 className="text-sm font-medium text-red-800">Error loading patterns</h3>
        <div className="mt-2 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!patterns || !patterns.topPatterns.length) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="text-sm font-medium text-gray-800">No patterns detected yet</h3>
        <p className="mt-2 text-sm text-gray-600">
          Start sending agreements to build up pattern data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Contract Patterns</h2>
        <p className="mt-1 text-sm text-gray-500">
          Analysis of contract categories and their typical sending days
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {patterns.topPatterns.map((pattern, index) => (
          <div key={`${pattern.day}-${pattern.category}`} className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {pattern.category} on {pattern.day}s
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {pattern.count} contracts ({Math.round(pattern.percentage)}% of {pattern.category} contracts)
                </p>
              </div>
              <div className="ml-4">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                    <div
                      style={{ width: `${pattern.percentage}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 