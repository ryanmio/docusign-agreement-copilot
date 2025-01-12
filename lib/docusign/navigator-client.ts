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
export interface NavigatorAgreement {
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
  public navigatorBasePath: string;
  public accountId?: string;
  public accessToken?: string;

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
    this.accountId = client.accountId;
    
    // Safely extract token from Authorization header
    const authHeader = Object.entries(client.headers)
      .find(([key]) => key.toLowerCase() === 'authorization')?.[1];
    this.accessToken = authHeader?.toString().split(' ')[1];
    
    const queryParams = new URLSearchParams();
    
    if (options?.from_date) queryParams.append('from_date', options.from_date);
    if (options?.to_date) queryParams.append('to_date', options.to_date);
    if (options?.agreement_type) queryParams.append('agreement_type', options.agreement_type);

    console.log('🔍 Debug: Making Navigator API request:', {
      url: `${this.navigatorBasePath}/v1/accounts/${client.accountId}/agreements?${queryParams}`,
      hasToken: !!this.accessToken,
      headers: {
        ...client.headers,
        'Accept': 'application/json'
      }
    });

    try {
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
          error: errorText,
          url: `${this.navigatorBasePath}/v1/accounts/${client.accountId}/agreements?${queryParams}`,
          headers: client.headers
        });
        throw new Error(`Failed to get agreements from Navigator API: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      // Log full response structure to see all available fields
      console.log('Navigator API full response structure:', {
        data,
        responseStatus: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        endpoint: `${this.navigatorBasePath}/v1/accounts/${client.accountId}/agreements?${queryParams}`
      });
      
      // Handle response where agreements are in data.data
      const agreements = data.data || [];
      
      // Add warning log if no agreements found
      if (!agreements.length) {
        console.warn('No agreements found in Navigator response:', {
          agreements,
          metadata: data.response_metadata,
          responseFields: Object.keys(data)
        });
      }

      // Return in expected format
      return {
        items: agreements,
        response_metadata: data.response_metadata
      };
    } catch (error) {
      console.error('Navigator API fetch error:', {
        error,
        url: `${this.navigatorBasePath}/v1/accounts/${client.accountId}/agreements?${queryParams}`,
        headers: client.headers
      });
      throw error;
    }
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

  /**
   * Transform agreements into timeline-friendly format
   * Groups events by agreement and sorts them chronologically
   */
  async getTimelineData(userId: string, options: {
    from_date: string;
    to_date: string;
  }): Promise<Array<{
    id: string;
    type: string;
    category: string;
    events: Array<{
      type: 'execution' | 'effective' | 'expiration' | 'modification';
      date: string;
      label: string;
    }>;
    parties: Array<{
      id: string;
      name: string;
    }>;
    metadata: {
      value?: string;
      currency?: string;
      jurisdiction?: string;
    };
  }>> {
    const agreements = await this.getAgreements(userId, options);
    const items = agreements.items || [];

    return items.map(agreement => {
      // Collect all valid dates
      const events = [];

      if (agreement.provisions?.execution_date) {
        events.push({
          type: 'execution',
          date: agreement.provisions.execution_date,
          label: 'Executed'
        });
      }

      if (agreement.provisions?.effective_date) {
        events.push({
          type: 'effective',
          date: agreement.provisions.effective_date,
          label: 'Effective'
        });
      }

      if (agreement.provisions?.expiration_date) {
        events.push({
          type: 'expiration',
          date: agreement.provisions.expiration_date,
          label: 'Expires'
        });
      }

      if (agreement.metadata?.modified_at) {
        events.push({
          type: 'modification',
          date: agreement.metadata.modified_at,
          label: 'Modified'
        });
      }

      // Sort events chronologically
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        id: agreement.id,
        type: agreement.type,
        category: agreement.category,
        events,
        parties: agreement.parties.map(p => ({
          id: p.id,
          name: p.name_in_agreement
        })),
        metadata: {
          value: agreement.provisions?.annual_agreement_value,
          currency: agreement.provisions?.annual_agreement_value_currency_code,
          jurisdiction: agreement.provisions?.jurisdiction
        }
      };
    });
  }
} 