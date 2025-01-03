import { SupabaseClient } from '@supabase/supabase-js';
import { DocuSignClient } from './client';

interface NavigatorAgreement {
  id: string;
  type: string;
  category: string;
  parties: Array<{
    id: string;
    name_in_agreement: string;
  }>;
  provisions: {
    effective_date?: string;
    expiration_date?: string;
    execution_date?: string;
    renewal_type?: string;
    renewal_notice_period?: string;
    renewal_notice_date?: string;
    [key: string]: any;
  };
  metadata: {
    created_at: string;
    created_by: string;
  };
}

export class NavigatorClient {
  private docuSignClient: DocuSignClient;
  private navigatorBasePath: string;

  constructor(supabase: SupabaseClient) {
    this.docuSignClient = new DocuSignClient(supabase);
    this.navigatorBasePath = process.env.NEXT_PUBLIC_DOCUSIGN_NAVIGATOR_BASE_PATH || 'https://navigator-d.docusign.com';
  }

  async getAgreements(userId: string, options?: {
    from_date?: string;
    to_date?: string;
    agreement_type?: string;
  }) {
    const client = await this.docuSignClient.getClient(userId);
    const queryParams = new URLSearchParams();
    
    if (options?.from_date) queryParams.append('from_date', options.from_date);
    if (options?.to_date) queryParams.append('to_date', options.to_date);
    if (options?.agreement_type) queryParams.append('agreement_type', options.agreement_type);

    const response = await fetch(
      `${this.navigatorBasePath}/v1/agreements?${queryParams}`,
      {
        headers: {
          ...client.headers,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get agreements from Navigator API');
    }

    return response.json();
  }

  async getAgreement(userId: string, agreementId: string) {
    const client = await this.docuSignClient.getClient(userId);

    const response = await fetch(
      `${this.navigatorBasePath}/v1/agreements/${agreementId}`,
      {
        headers: {
          ...client.headers,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get agreement from Navigator API');
    }

    return response.json();
  }

  async analyzePatterns(userId: string, options: {
    from_date: string;
    to_date: string;
  }): Promise<{
    totalAgreements: number;
    byDayOfWeek: Record<string, number>;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const agreements = await this.getAgreements(userId, options);
    
    const analysis = {
      totalAgreements: 0,
      byDayOfWeek: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
    };

    for (const agreement of agreements.items) {
      analysis.totalAgreements++;

      // Analyze day of week
      const createdAt = new Date(agreement.metadata.created_at);
      const dayOfWeek = createdAt.toLocaleDateString('en-US', { weekday: 'long' });
      analysis.byDayOfWeek[dayOfWeek] = (analysis.byDayOfWeek[dayOfWeek] || 0) + 1;

      // Analyze agreement type
      analysis.byType[agreement.type] = (analysis.byType[agreement.type] || 0) + 1;

      // Analyze category
      analysis.byCategory[agreement.category] = (analysis.byCategory[agreement.category] || 0) + 1;
    }

    return analysis;
  }
} 