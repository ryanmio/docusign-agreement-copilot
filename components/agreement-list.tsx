import { formatDistanceToNow, format } from 'date-fns';

interface Agreement {
  id: string;
  file_name: string;
  type: string;
  category: string;
  status: string;
  parties: Array<{
    id: string;
    name_in_agreement: string;
  }>;
  provisions: {
    effective_date?: string;
    expiration_date?: string;
    execution_date?: string;
    term_length?: string;
    jurisdiction?: string;
    annual_agreement_value?: number;
    annual_agreement_value_currency_code?: string;
  };
}

interface AgreementListProps {
  agreements: Agreement[];
  title?: string;
  subtitle?: string;
}

export function AgreementList({ agreements, title = "Agreements", subtitle }: AgreementListProps) {
  if (!agreements.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No agreements found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        <p className="text-sm text-gray-500 mt-2">
          Found {agreements.length} agreement{agreements.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-6">
        {agreements.map((agreement) => (
          <div
            key={agreement.id}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium text-lg">
                  {agreement.file_name.replace(/_/g, ' ').replace('.pdf', '')}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {agreement.type}
                  </span>
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded">
                    {agreement.category}
                  </span>
                </div>
              </div>
              {agreement.provisions.annual_agreement_value && (
                <div className="text-right">
                  <div className="text-lg font-mono font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: agreement.provisions.annual_agreement_value_currency_code || 'USD'
                    }).format(agreement.provisions.annual_agreement_value)}
                  </div>
                  <div className="text-sm text-gray-500">Annual Value</div>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">Parties</div>
                <ul className="mt-1 space-y-1">
                  {agreement.parties.map((party) => (
                    <li key={party.id} className="text-gray-600">
                      {party.name_in_agreement}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-gray-700">Key Dates</div>
                <div className="mt-1 space-y-1 text-gray-600">
                  {agreement.provisions.effective_date && (
                    <div>
                      Effective: {format(new Date(agreement.provisions.effective_date), 'PP')}
                    </div>
                  )}
                  {agreement.provisions.expiration_date && (
                    <div>
                      Expires: {format(new Date(agreement.provisions.expiration_date), 'PP')}
                      <span className="text-gray-400 ml-1">
                        ({formatDistanceToNow(new Date(agreement.provisions.expiration_date), { addSuffix: true })})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {agreement.provisions.jurisdiction && (
              <div className="mt-4 text-sm text-gray-500">
                Jurisdiction: {agreement.provisions.jurisdiction}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 