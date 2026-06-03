import { JIRA_TYPE_MAP, JIRA_STATUS_MAP } from '@/lib/types';
import { mapJiraStatusToLocal } from '@/lib/jira';

describe('Jira Integration - Type Mapping', () => {
  test('maps report types to Jira issue types correctly', () => {
    expect(JIRA_TYPE_MAP.bug).toBe('Bug');
    expect(JIRA_TYPE_MAP.task).toBe('Task');
    expect(JIRA_TYPE_MAP.feature).toBe('Story');
  });

  test('has all required type mappings', () => {
    const types = ['bug', 'task', 'feature'] as const;
    types.forEach((type) => {
      expect(JIRA_TYPE_MAP[type]).toBeDefined();
      expect(typeof JIRA_TYPE_MAP[type]).toBe('string');
    });
  });
});

describe('Jira Integration - Status Mapping', () => {
  test('maps Jira status names to local status correctly', () => {
    expect(mapJiraStatusToLocal('Open')).toBe('open');
    expect(mapJiraStatusToLocal('In Progress')).toBe('in_progress');
    expect(mapJiraStatusToLocal('Resolved')).toBe('resolved');
    expect(mapJiraStatusToLocal('Closed')).toBe('closed');
    expect(mapJiraStatusToLocal('Done')).toBe('closed');
    expect(mapJiraStatusToLocal('Reopened')).toBe('reopened');
    expect(mapJiraStatusToLocal('To Do')).toBe('open');
    expect(mapJiraStatusToLocal('In Review')).toBe('in_progress');
  });

  test('returns open for unknown status', () => {
    expect(mapJiraStatusToLocal('Unknown')).toBe('open');
    expect(mapJiraStatusToLocal('')).toBe('open');
    expect(mapJiraStatusToLocal('Some Random Status')).toBe('open');
  });

  test('JIRA_STATUS_MAP has all expected values', () => {
    const expectedStatuses = ['open', 'in_progress', 'resolved', 'closed', 'reopened'];
    Object.values(JIRA_STATUS_MAP).forEach((status) => {
      expect(expectedStatuses).toContain(status);
    });
  });
});
