'use client';

import { useState, useEffect } from 'react';
import { NavigatorAgreement } from '@/lib/docusign/navigator-client';

interface PriorityItem {
  id: string;
  daysUntilExpiration: number;
  value: number;
  parties: string[];
  type: string;
  urgencyLevel: 'critical' | 'urgent' | 'upcoming';
}

function calculatePriority(agreement: NavigatorAgreement): number {
  const expirationDate = agreement.provisions.expiration_date;
  if (!expirationDate) return 0;

  const daysUntilExpiration = Math.ceil(
    (new Date(expirationDate).getTime() - Date.now()) / 
    (1000 * 60 * 60 * 24)
  );
  const financialImpact = agreement.provisions.annual_agreement_value || 0;
  const baseScore = (30 - daysUntilExpiration) * 10;  // More urgent as expiration approaches
  const valueScore = financialImpact ? Math.log10(financialImpact) * 5 : 0;  // Higher value = higher priority
  return baseScore + valueScore;
}

function getUrgencyLevel(daysUntilExpiration: number): PriorityItem['urgencyLevel'] {
  if (daysUntilExpiration <= 3) return 'critical';
  if (daysUntilExpiration <= 7) return 'urgent';
  return 'upcoming';
}

export default function PriorityDashboard() {
  const [priorityItems, setPriorityItems] = useState<PriorityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPriorityItems() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/navigator-priorities');
        if (!response.ok) throw new Error('Failed to fetch priorities');
        
        const data = await response.json();
        const items = data.items
          .map((agreement: NavigatorAgreement) => {
            const expirationDate = agreement.provisions.expiration_date;
            if (!expirationDate) return null;

            const daysUntilExpiration = Math.ceil(
              (new Date(expirationDate).getTime() - Date.now()) / 
              (1000 * 60 * 60 * 24)
            );
            
            return {
              id: agreement.id,
              daysUntilExpiration,
              value: agreement.provisions.annual_agreement_value || 0,
              parties: agreement.parties.map(p => p.name_in_agreement),
              type: agreement.type,
              urgencyLevel: getUrgencyLevel(daysUntilExpiration)
            } as const;
          })
          .filter((item: PriorityItem | null): item is PriorityItem => item !== null)
          .sort((a: PriorityItem, b: PriorityItem) => {
            const agreementA = {
              id: a.id,
              provisions: { expiration_date: new Date(Date.now() + a.daysUntilExpiration * 24 * 60 * 60 * 1000).toISOString() }
            } as NavigatorAgreement;
            const agreementB = {
              id: b.id,
              provisions: { expiration_date: new Date(Date.now() + b.daysUntilExpiration * 24 * 60 * 60 * 1000).toISOString() }
            } as NavigatorAgreement;
            return calculatePriority(agreementB) - calculatePriority(agreementA);
          });

        setPriorityItems(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPriorityItems();
  }, []);

  if (isLoading) return <div>Loading priorities...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Priority Dashboard</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-red-100 rounded-lg">
          <h3>Critical</h3>
          <p>{priorityItems.filter(i => i.urgencyLevel === 'critical').length} items</p>
        </div>
        <div className="p-4 bg-orange-100 rounded-lg">
          <h3>Urgent</h3>
          <p>{priorityItems.filter(i => i.urgencyLevel === 'urgent').length} items</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded-lg">
          <h3>Upcoming</h3>
          <p>{priorityItems.filter(i => i.urgencyLevel === 'upcoming').length} items</p>
        </div>
      </div>

      {/* Priority List */}
      <div className="space-y-2">
        {priorityItems.map((item) => (
          <div 
            key={item.id}
            className={`p-4 rounded-lg ${
              item.urgencyLevel === 'critical' ? 'bg-red-50' :
              item.urgencyLevel === 'urgent' ? 'bg-orange-50' :
              'bg-yellow-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.type}</h3>
                <p className="text-sm text-gray-600">
                  {item.parties.join(', ')}
                </p>
                <p className="text-sm">
                  {item.daysUntilExpiration} days until expiration
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono">
                  ${item.value.toLocaleString()}
                </p>
                <button 
                  className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => {/* TODO: Handle review action */}}
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 