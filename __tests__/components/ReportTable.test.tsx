import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import type { Report } from '@/lib/types';

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Error al iniciar sesión',
    type: 'bug',
    priority: 'high',
    status: 'open',
    description: 'No permite iniciar sesión con credenciales válidas',
    module_id: null,
    reporter_id: 'user1',
    jira_ticket_id: null,
    jira_ticket_key: null,
    attachments: [],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    module: undefined,
    reporter: { id: 'user1', name: 'Juan Pérez', role: 'reporter', created_at: '', updated_at: '' },
  },
  {
    id: '2',
    title: 'Mejorar rendimiento del dashboard',
    type: 'feature',
    priority: 'medium',
    status: 'in_progress',
    description: 'Los gráficos tardan mucho en cargar',
    module_id: 'mod1',
    reporter_id: 'user2',
    jira_ticket_id: '10001',
    jira_ticket_key: 'CA-123',
    attachments: [],
    created_at: '2024-01-14T08:00:00Z',
    updated_at: '2024-01-14T08:00:00Z',
    module: { id: 'mod1', name: 'Dashboard', description: null, created_at: '', updated_at: '' },
    reporter: { id: 'user2', name: 'María García', role: 'admin', created_at: '', updated_at: '' },
  },
];

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/dashboard'),
}));

describe('ReportTable Component', () => {
  test('renders loading state', async () => {
    const ReportTable = (await import('@/components/ReportTable')).default;
    const { container } = render(<ReportTable reports={[]} loading={true} />);
    const loadingElements = container.querySelectorAll('.animate-spin');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('renders empty state when no reports', async () => {
    const ReportTable = (await import('@/components/ReportTable')).default;
    render(<ReportTable reports={[]} loading={false} />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron reportes con los filtros actuales.')).toBeInTheDocument();
  });

  test('renders report rows', async () => {
    const ReportTable = (await import('@/components/ReportTable')).default;
    render(<ReportTable reports={mockReports} loading={false} />);

    // Both desktop table and mobile cards render titles, use getAllByText
    expect(screen.getAllByText('Error al iniciar sesión').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mejorar rendimiento del dashboard').length).toBeGreaterThan(0);

    expect(screen.getAllByText('CA-123').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
  });

  test('renders correct type labels', async () => {
    const ReportTable = (await import('@/components/ReportTable')).default;
    render(<ReportTable reports={mockReports} loading={false} />);

    // Type labels appear with emojis, and regex matches title text too — use getAllByText
    expect(screen.getAllByText(/Error/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mejora/).length).toBeGreaterThan(0);
  });

  test('renders correct status labels', async () => {
    const ReportTable = (await import('@/components/ReportTable')).default;
    render(<ReportTable reports={mockReports} loading={false} />);

    // Statuses appear in both desktop and mobile views
    expect(screen.getAllByText('Abierto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En Progreso').length).toBeGreaterThan(0);
  });
});
