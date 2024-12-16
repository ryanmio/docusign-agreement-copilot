import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/supabase';

export async function GET() {
  const result = await testConnection();
  return NextResponse.json(result);
} 