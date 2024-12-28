import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DocuSignEnvelopes } from '@/lib/docusign/envelopes';
import { z } from 'zod';

const listTemplatesSchema = z.object({
  searchText: z.string().optional(),
  folder: z.string().optional(),
  shared: z.boolean().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/templates - Starting request');
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('GET /api/templates - Authentication error:', userError);
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has connected DocuSign
    const { data: credentials, error: credentialsError } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'docusign')
      .single();

    if (credentialsError || !credentials) {
      console.log('GET /api/templates - DocuSign credentials error:', credentialsError);
      return NextResponse.json(
        { error: 'Please connect your DocuSign account first' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = listTemplatesSchema.parse({
      searchText: searchParams.get('search') || undefined,
      folder: searchParams.get('folder') || undefined,
      shared: searchParams.get('shared') ? searchParams.get('shared') === 'true' : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined,
    });

    console.log('GET /api/templates - Fetching templates with params:', params);

    const docusign = new DocuSignEnvelopes(supabase);
    const templates = await docusign.listTemplates(user.id, params);

    console.log('GET /api/templates - Success:', {
      resultSetSize: templates.resultSetSize,
      totalSetSize: templates.totalSetSize,
      templateCount: templates.templates?.length
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('GET /api/templates - Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to list templates' },
      { status: 500 }
    );
  }
} 