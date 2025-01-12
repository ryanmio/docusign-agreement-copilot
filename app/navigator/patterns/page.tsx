'use client';

import PatternDetection from '@/components/pattern-detection';

export default function PatternsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Contract Patterns</h1>
          <p className="text-gray-600 mt-2">
            Analyze patterns in contract categories and sending days
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <PatternDetection />
          </div>
        </div>
      </div>
    </div>
  );
} 