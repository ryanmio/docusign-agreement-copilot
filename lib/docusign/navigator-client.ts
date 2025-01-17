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

interface GetAgreementsOptions {
  limit?: number;
  ctoken?: string;
}

export class NavigatorClient {
  private docuSignClient: DocuSignClient;
  public navigatorBasePath: string;

  constructor(supabase: SupabaseClient) {
    this.docuSignClient = new DocuSignClient(supabase);
    this.navigatorBasePath = process.env.NEXT_PUBLIC_DOCUSIGN_NAVIGATOR_BASE_PATH || 'https://api-d.docusign.com';
  }

  /**
   * Check if Navigator has any agreements uploaded
   * Returns true if agreements exist, false if empty
   */
  async hasAgreements(userId: string): Promise<boolean> {
    const agreements = await this.getAgreements(userId);
    const items = Array.isArray(agreements) ? agreements : agreements.items || [];
    return items.length > 0;
  }

  async getAgreements(userId: string, options?: GetAgreementsOptions) {
    // Get a valid token using DocuSignClient's token management
    const token = await this.docuSignClient.getValidToken(userId);
    const userInfo = await this.docuSignClient.getUserInfo(userId);
    const accountId = userInfo.accounts.find(a => a.is_default)?.account_id || userInfo.accounts[0]?.account_id;

    if (!accountId) {
      throw new Error('No DocuSign account found');
    }

    const queryParams = new URLSearchParams();
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.ctoken) queryParams.append('ctoken', options.ctoken);

    console.log('🔍 Debug: Making Navigator API request:', {
      url: `${this.navigatorBasePath}/v1/accounts/${accountId}/agreements?${queryParams}`,
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 10) + '...' : 'none',
      accountId
    });

    try {
      const response = await fetch(
        `${this.navigatorBasePath}/v1/accounts/${accountId}/agreements?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
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
          url: `${this.navigatorBasePath}/v1/accounts/${accountId}/agreements?${queryParams}`,
        });
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please reconnect DocuSign to refresh your token.');
        }
        
        throw new Error(`Failed to get agreements from Navigator API: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      // Log full response structure to see all available fields
      console.log('Navigator API full response structure:', {
        data,
        responseStatus: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        endpoint: `${this.navigatorBasePath}/v1/accounts/${accountId}/agreements?${queryParams}`
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
        url: `${this.navigatorBasePath}/v1/accounts/${accountId}/agreements?${queryParams}`,
      });
      throw error;
    }
  }

  async getAgreement(userId: string, agreementId: string) {
    const token = await this.docuSignClient.getValidToken(userId);
    const userInfo = await this.docuSignClient.getUserInfo(userId);
    const accountId = userInfo.accounts.find(a => a.is_default)?.account_id || userInfo.accounts[0]?.account_id;

    if (!accountId) {
      throw new Error('No DocuSign account found');
    }

    const response = await fetch(
      `${this.navigatorBasePath}/v1/accounts/${accountId}/agreements/${agreementId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
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

  async analyzePatterns(userId: string): Promise<{
    totalAgreements: number;
    byDayOfWeek: Record<string, number>;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const agreements = await this.getAgreements(userId);
    
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