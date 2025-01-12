import PriorityDashboard from '@/components/priority-dashboard';

export default function PrioritiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Agreement Priorities</h1>
          <p className="text-gray-600 mt-2">
            Monitor urgent agreements and upcoming deadlines
          </p>
        </div>

        <PriorityDashboard />
      </div>
    </div>
  );
} 