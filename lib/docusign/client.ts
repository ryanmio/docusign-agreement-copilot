import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface DocuSignToken {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

interface DocuSignUserInfo {
  sub: string;
  name: string;
  email: string;
  accounts: Array<{
    account_id: string;
    is_default: boolean;
    account_name: string;
    base_uri: string;
  }>;
}

export class DocuSignClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private authServer: string;
  private basePath: string;

  constructor() {
    this.clientId = process.env.DOCUSIGN_CLIENT_ID!;
    this.clientSecret = process.env.DOCUSIGN_CLIENT_SECRET!;
    this.authServer = process.env.DOCUSIGN_AUTHORIZATION_SERVER!;
    this.basePath = process.env.DOCUSIGN_OAUTH_BASE_PATH!;
    this.redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/docusign/callback`;
  }

  private async getSupabase() {
    const cookieStore = cookies();
    return createRouteHandlerClient({ cookies: () => cookieStore });
  }

  public getAuthorizationUrl(): string {
    const scopes = [
      'signature',
      'extended',
      'impersonation',
    ].join('+');

    return `${this.basePath}/oauth/auth?` +
      `response_type=code&` +
      `scope=${scopes}&` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}`;
  }

  private async storeTokens(userId: string, tokens: DocuSignToken) {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('api_credentials')
      .upsert({
        user_id: userId,
        provider: 'docusign',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at,
        updated_at: new Date().toISOString(),
      })
      .match({ user_id: userId, provider: 'docusign' });

    if (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store tokens');
    }
  }

  public async exchangeCodeForToken(code: string, userId: string): Promise<void> {
    const response = await fetch(`${this.basePath}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Token exchange error:', error);
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

    await this.storeTokens(userId, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
    });
  }

  public async refreshToken(userId: string, refreshToken: string): Promise<DocuSignToken> {
    const response = await fetch(`${this.basePath}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

    const tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
    };

    await this.storeTokens(userId, tokens);
    return tokens;
  }

  public async getValidToken(userId: string): Promise<string> {
    const supabase = await this.getSupabase();
    const { data: credentials, error } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'docusign')
      .single();

    if (error || !credentials) {
      console.error('Error fetching credentials:', error);
      throw new Error('No DocuSign credentials found');
    }

    const expiresAt = new Date(credentials.expires_at);
    const now = new Date();

    // Refresh if token expires in less than 5 minutes
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      const newTokens = await this.refreshToken(userId, credentials.refresh_token);
      return newTokens.access_token;
    }

    return credentials.access_token;
  }

  public async getUserInfo(userId: string): Promise<DocuSignUserInfo> {
    const token = await this.getValidToken(userId);
    const response = await fetch(`${this.basePath}/oauth/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const data = await response.json();
    return {
      sub: data.sub,
      name: data.name,
      email: data.email,
      accounts: data.accounts.map((account: any) => ({
        account_id: account.account_id,
        is_default: account.is_default,
        account_name: account.account_name,
        base_uri: account.base_uri,
      })),
    };
  }

  public async getClient(userId: string): Promise<{ accountId: string; baseUrl: string; headers: HeadersInit }> {
    const token = await this.getValidToken(userId);
    const userInfo = await this.getUserInfo(userId);
    const defaultAccount = userInfo.accounts.find(a => a.is_default) || userInfo.accounts[0];

    return {
      accountId: defaultAccount.account_id,
      baseUrl: defaultAccount.base_uri,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }
} 