import { JIRA_TYPE_MAP, type Report, type ReportStatus, JIRA_STATUS_MAP } from './types';

const JIRA_URL = process.env.JIRA_URL!;
const JIRA_EMAIL = process.env.JIRA_EMAIL!;
const JIRA_PAT = process.env.JIRA_PAT!;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'CA';

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_PAT}`).toString('base64');

const headers = {
  Authorization: `Basic ${auth}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export async function createJiraIssue(report: Report): Promise<{ id: string; key: string }> {
  const issueType = JIRA_TYPE_MAP[report.type];
  const priorityName = report.priority === 'critical' ? 'Highest'
    : report.priority === 'high' ? 'High'
    : report.priority === 'medium' ? 'Medium'
    : 'Low';

  const body = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary: report.title,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: report.description,
              },
            ],
          },
          ...(report.module?.name
            ? [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: `\n\nMódulo afectado: ${report.module.name}` },
                  ],
                },
              ]
            : []),
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: `\nReportado por: ${report.reporter?.name || 'Usuario AppDesk'}` },
            ],
          },
        ],
      },
      issuetype: { name: issueType },
      priority: { name: priorityName },
    },
  };

  const res = await fetch(`${JIRA_URL}/rest/api/3/issue`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Jira API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return { id: data.id, key: data.key };
}

export async function getJiraIssueStatus(issueKey: string): Promise<{
  status: string;
  statusName: string;
  updated: string;
}> {
  const res = await fetch(
    `${JIRA_URL}/rest/api/3/issue/${issueKey}?fields=status,updated`,
    { headers }
  );

  if (!res.ok) {
    throw new Error(`Jira API error (GET): ${res.status}`);
  }

  const data = await res.json();
  return {
    status: data.fields.status.name,
    statusName: data.fields.status.name,
    updated: data.fields.updated,
  };
}

export function mapJiraStatusToLocal(jiraStatusName: string): ReportStatus {
  return JIRA_STATUS_MAP[jiraStatusName] || 'open';
}

export async function searchJiraIssuesByReporter(reporterName?: string): Promise<any[]> {
  let jql = `project = ${JIRA_PROJECT_KEY} ORDER BY created DESC`;
  if (reporterName) {
    jql = `project = ${JIRA_PROJECT_KEY} AND reporter = "${reporterName}" ORDER BY created DESC`;
  }

  const res = await fetch(
    `${JIRA_URL}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,status,priority,issuetype,created,updated`,
    { headers }
  );

  if (!res.ok) {
    throw new Error(`Jira API error (SEARCH): ${res.status}`);
  }

  const data = await res.json();
  return data.issues || [];
}
