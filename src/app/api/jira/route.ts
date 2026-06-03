import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createJiraIssue, getJiraIssueStatus, mapJiraStatusToLocal } from '@/lib/jira';

// POST - Create a Jira ticket from a report
export async function POST(request: Request) {
  try {
    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 });
    }

    // Verify auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the report with relations
    const { data: report, error: dbError } = await supabase
      .from('reports')
      .select(`
        *,
        module:modules(*),
        reporter:profiles(*)
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
      .from('reports')
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

    let targetIssueKey = issueKey;

    if (reportId && !issueKey) {
      const { data: report } = await supabase
        .from('reports')
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
        .from('reports')
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
