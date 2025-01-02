import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { DocuSignEnvelopes } from '../docusign/envelopes';

interface PatternValidationResult {
  totalEnvelopes: number;
  tuesdayStats: {
    count: number;
    envelopes: Array<{
      id: string;
      createdDateTime: string;
      templateId?: string;
      templateName?: string;
      subject: string;
    }>;
    byHour: Record<string, number>; // e.g., "9AM": 3
    byTemplate: Record<string, {
      count: number;
      templateName: string;
    }>;
  };
  confidence: number;
  analysis: string;
}

export async function validateTuesdayPattern(
  supabase: SupabaseClient,
  userId: string
): Promise<PatternValidationResult> {
  console.log('\n=== Starting Tuesday Pattern Validation ===\n');
  
  const docusign = new DocuSignEnvelopes(supabase);
  
  // Get last 4 weeks of envelopes
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  console.log(`Fetching envelopes from ${fourWeeksAgo.toISOString()}`);
  
  const { envelopes } = await docusign.listStatusChanges(userId, {
    from_date: fourWeeksAgo.toISOString(),
    include: ['recipients']
  });

  console.log(`\nTotal envelopes found: ${envelopes.length}`);

  // Filter for Tuesday envelopes
  const tuesdayEnvelopes = envelopes.filter(env => {
    const date = new Date(env.createdDateTime);
    return date.getDay() === 2; // 2 = Tuesday
  });

  // Group Tuesday envelopes by hour
  const byHour = tuesdayEnvelopes.reduce((acc, env) => {
    const date = new Date(env.createdDateTime);
    const hour = date.getHours();
    const hourKey = `${hour}:00`;
    acc[hourKey] = (acc[hourKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by template
  const byTemplate = tuesdayEnvelopes.reduce((acc, env) => {
    if (!env.templateId) return acc;
    
    if (!acc[env.templateId]) {
      acc[env.templateId] = {
        count: 0,
        templateName: env.templateName || 'Unknown Template'
      };
    }
    acc[env.templateId].count++;
    return acc;
  }, {} as Record<string, { count: number; templateName: string }>);

  // Calculate confidence score (0-1)
  // High confidence if:
  // 1. We have Tuesday envelopes
  // 2. They're clustered around similar times
  // 3. They use similar templates
  let confidence = 0;
  if (tuesdayEnvelopes.length > 0) {
    // Base confidence on number of Tuesdays with activity
    const tuesdayDates = new Set(
      tuesdayEnvelopes.map(env => 
        new Date(env.createdDateTime).toDateString()
      )
    );
    confidence = Math.min(tuesdayDates.size / 4, 1); // 4 weeks max

    // Boost if we see template patterns
    const hasConsistentTemplate = Object.values(byTemplate)
      .some(t => t.count >= 2);
    if (hasConsistentTemplate) {
      confidence += 0.2;
    }

    // Boost if we see time patterns
    const hasTimePattern = Object.values(byHour)
      .some(count => count >= 2);
    if (hasTimePattern) {
      confidence += 0.2;
    }

    confidence = Math.min(confidence, 1);
  }

  // Generate analysis
  const analysis = generateAnalysis(tuesdayEnvelopes.length, byHour, byTemplate);

  console.log('\n=== Pattern Analysis Results ===');
  console.log('\nTuesday Envelope Count:', tuesdayEnvelopes.length);
  console.log('\nBy Hour:', byHour);
  console.log('\nBy Template:', byTemplate);
  console.log('\nConfidence Score:', confidence);
  console.log('\nAnalysis:', analysis);

  return {
    totalEnvelopes: envelopes.length,
    tuesdayStats: {
      count: tuesdayEnvelopes.length,
      envelopes: tuesdayEnvelopes.map(env => ({
        id: env.envelopeId,
        createdDateTime: env.createdDateTime,
        templateId: env.templateId,
        templateName: env.templateName,
        subject: env.emailSubject
      })),
      byHour,
      byTemplate
    },
    confidence,
    analysis
  };
}

function generateAnalysis(
  tuesdayCount: number,
  byHour: Record<string, number>,
  byTemplate: Record<string, { count: number; templateName: string }>
): string {
  if (tuesdayCount === 0) {
    return "No Tuesday patterns detected in the last 4 weeks.";
  }

  const parts: string[] = [];

  // Analyze time patterns
  const commonHours = Object.entries(byHour)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .map(([hour, count]) => `${hour} (${count} times)`);

  if (commonHours.length > 0) {
    parts.push(`Most common Tuesday times: ${commonHours.join(', ')}`);
  }

  // Analyze template patterns
  const commonTemplates = Object.entries(byTemplate)
    .filter(([_, { count }]) => count >= 2)
    .sort(([_, a], [__, b]) => b.count - a.count)
    .map(([_, { count, templateName }]) => 
      `${templateName} (${count} times)`
    );

  if (commonTemplates.length > 0) {
    parts.push(`Common Tuesday templates: ${commonTemplates.join(', ')}`);
  }

  if (parts.length === 0) {
    return `Found ${tuesdayCount} Tuesday envelopes, but no strong patterns detected.`;
  }

  return parts.join('\n');
} 