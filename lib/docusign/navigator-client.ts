import { SupabaseClient } from '@supabase/supabase-js';
import { DocuSignClient } from './client';

/**
 * Navigator Agreement Interface
 * Note: Agreements must be uploaded to Navigator through the UI first.
 * They don't automatically sync from DocuSign eSignature.
 * 
 * Steps to get agreements into Navigator:
 * 1. Upload agreements through Navigator UI
 * 2. Wait for AI analysis to complete
 * 3. Access through Navigator API
 */
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
    this.navigatorBasePath = process.env.NEXT_PUBLIC_DOCUSIGN_NAVIGATOR_BASE_PATH || 'https://api-d.docusign.com';
  }

  /**
   * Check if Navigator has any agreements uploaded
   * Returns true if agreements exist, false if empty
   */
  async hasAgreements(userId: string): Promise<boolean> {
    const agreements = await this.getAgreements(userId, {
      from_date: new Date(0).toISOString(), // From beginning of time
      to_date: new Date().toISOString()     // To now
    });
    
    const items = Array.isArray(agreements) ? agreements : agreements.items || [];
    return items.length > 0;
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
      `${this.navigatorBasePath}/v1/accounts/${client.accountId}/agreements?${queryParams}`,
      {
        headers: {
          ...client.headers,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Navigator API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to get agreements from Navigator API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Add warning log if no agreements found
    if (!data.items?.length) {
      console.warn('No agreements found in Navigator. Agreements must be uploaded through Navigator UI first.');
    }

    return data;
  }

  async getAgreement(userId: string, agreementId: string) {
    const client = await this.docuSignClient.getClient(userId);

    const response = await fetch(
      `${this.navigatorBasePath}/v1/accounts/${client.accountId}/agreements/${agreementId}`,
      {
        headers: {
          ...client.headers,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Navigator API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to get agreement from Navigator API: ${response.status} ${response.statusText}`);
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

    // Handle both single agreement and array responses
    const items = Array.isArray(agreements) ? agreements : agreements.items || [];

    for (const agreement of items) {
      analysis.totalAgreements++;

      // Analyze day of week
      const createdAt = new Date(agreement.metadata.created_at);
      const dayOfWeek = createdAt.toLocaleDateString('en-US', { weekday: 'long' });
      analysis.byDayOfWeek[dayOfWeek] = (analysis.byDayOfWeek[dayOfWeek] || 0) + 1;

      // Analyze agreement type
      if (agreement.type) {
        analysis.byType[agreement.type] = (analysis.byType[agreement.type] || 0) + 1;
      }

      // Analyze category
      if (agreement.category) {
        analysis.byCategory[agreement.category] = (analysis.byCategory[agreement.category] || 0) + 1;
      }
    }

    return analysis;
  }
} 