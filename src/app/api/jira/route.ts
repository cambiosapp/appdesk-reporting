import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createJiraIssue, getJiraIssueStatus, mapJiraStatusToLocal } from '@/lib/jira';
import { jiraCreateSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

// POST - Create a Jira ticket from a report
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with Zod
    const parsed = jiraCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { reportId } = parsed.data;

    // Verify auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    const limit = rateLimit(`jira:post:${user.id}`);
    if (limit) return limit;

    // Get the report with relations
    const { data: report, error: dbError } = await supabase
      .from('appdesk_reports')
      .select(`
        *,
        module:appdesk_modules(*),
        reporter:appdesk_profiles(*)
      `)
      .eq('id', reportId)
      .single();

    if (dbError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Create Jira issue
    const jiraResult = await createJiraIssue(report as any);

    // Update report with Jira info
    const { error: updateError } = await supabase
      .from('appdesk_reports')
      .update({
        jira_ticket_id: jiraResult.id,
        jira_ticket_key: jiraResult.key,
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Error updating report with Jira info:', updateError);
    }

    return NextResponse.json({
      success: true,
      jiraId: jiraResult.id,
      jiraKey: jiraResult.key,
    });
  } catch (error: any) {
    console.error('Jira API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Sync Jira status for a report
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    const issueKey = searchParams.get('issueKey');

    // Verify auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    const limit = rateLimit(`jira:get:${user.id}`);
    if (limit) return limit;

    let targetIssueKey = issueKey;

    if (reportId && !issueKey) {
      const { data: report } = await supabase
        .from('appdesk_reports')
        .select('jira_ticket_key')
        .eq('id', reportId)
        .single();

      if (!report?.jira_ticket_key) {
        return NextResponse.json({ error: 'No Jira ticket linked' }, { status: 404 });
      }

      targetIssueKey = report.jira_ticket_key;
    }

    if (!targetIssueKey) {
      return NextResponse.json({ error: 'issueKey or reportId required' }, { status: 400 });
    }

    const jiraStatus = await getJiraIssueStatus(targetIssueKey);
    const localStatus = mapJiraStatusToLocal(jiraStatus.statusName);

    if (reportId) {
      await supabase
        .from('appdesk_reports')
        .update({ status: localStatus })
        .eq('id', reportId);
    }

    return NextResponse.json({
      success: true,
      issueKey: targetIssueKey,
      jiraStatus: jiraStatus.statusName,
      localStatus,
      updated: jiraStatus.updated,
    });
  } catch (error: any) {
    console.error('Jira sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
