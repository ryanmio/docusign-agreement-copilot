import { SupabaseClient } from '@supabase/supabase-js';
import { DocuSignEnvelopes } from '../docusign/envelopes';

// Extend the base Envelope type with additional fields we need
interface EnvelopeWithTemplate {
  envelopeId: string;
  status: string;
  emailSubject: string;
  createdDateTime: string;
  sentDateTime?: string;
  templateId?: string;
  templateName?: string;
  recipients: Array<{
    email: string;
    name: string;
    status: string;
  }>;
}

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
    bySubject: Record<string, {
      count: number;
      timesSent: Array<string>; // Store times this subject was sent
    }>;
  };
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
  const tuesdayEnvelopes = (envelopes as EnvelopeWithTemplate[]).filter(env => {
    const date = new Date(env.sentDateTime || env.createdDateTime);
    return date.getDay() === 2; // 2 = Tuesday
  });

  // Group Tuesday envelopes by hour
  const byHour = tuesdayEnvelopes.reduce((acc, env) => {
    const date = new Date(env.sentDateTime || env.createdDateTime);
    const hour = date.getHours();
    const hourKey = `${hour}:00`;
    acc[hourKey] = (acc[hourKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by subject (focusing on Vendor Renewal Agreement pattern)
  const bySubject = tuesdayEnvelopes.reduce((acc, env) => {
    const subject = env.emailSubject;
    
    if (!acc[subject]) {
      acc[subject] = {
        count: 0,
        timesSent: []
      };
    }
    
    // Add the time this subject was sent
    const date = new Date(env.sentDateTime || env.createdDateTime);
    const timeStr = `${date.getHours()}:00`;
    acc[subject].timesSent.push(timeStr);
    acc[subject].count++;
    
    return acc;
  }, {} as Record<string, { count: number; timesSent: string[] }>);

  // Generate analysis
  const analysis = generateAnalysis(tuesdayEnvelopes.length, byHour, bySubject);

  console.log('\n=== Pattern Analysis Results ===');
  console.log('\nTuesday Envelope Count:', tuesdayEnvelopes.length);
  console.log('\nBy Hour:', byHour);
  console.log('\nBy Subject:', JSON.stringify(bySubject, null, 2));
  console.log('\nAnalysis:', analysis);

  return {
    totalEnvelopes: envelopes.length,
    tuesdayStats: {
      count: tuesdayEnvelopes.length,
      envelopes: tuesdayEnvelopes.map(env => ({
        id: env.envelopeId,
        createdDateTime: env.sentDateTime || env.createdDateTime,
        templateId: env.templateId,
        templateName: env.templateName,
        subject: env.emailSubject
      })),
      byHour,
      bySubject
    },
    analysis
  };
}

function generateAnalysis(
  tuesdayCount: number,
  byHour: Record<string, number>,
  bySubject: Record<string, { count: number; timesSent: string[] }>
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

  // Analyze subject patterns
  const commonSubjects = Object.entries(bySubject)
    .filter(([_, { count }]) => count >= 2)
    .sort(([_, a], [__, b]) => b.count - a.count)
    .map(([subject, { count, timesSent }]) => {
      const commonTime = findMostCommonTime(timesSent);
      return `"${subject}" (${count} times${commonTime ? `, usually at ${commonTime}` : ''})`;
    });

  if (commonSubjects.length > 0) {
    parts.push(`Common Tuesday documents: ${commonSubjects.join(', ')}`);
  }

  if (parts.length === 0) {
    return `Found ${tuesdayCount} Tuesday envelopes, but no strong patterns detected.`;
  }

  return parts.join('\n');
}

function findMostCommonTime(times: string[]): string | null {
  if (times.length < 2) return null;
  
  const counts: Record<string, number> = {};
  times.forEach(time => {
    counts[time] = (counts[time] || 0) + 1;
  });
  
  const mostCommon = Object.entries(counts)
    .sort(([_, a], [__, b]) => b - a)[0];
    
  return mostCommon[1] >= 2 ? mostCommon[0] : null;
} 