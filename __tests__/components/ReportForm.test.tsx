import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/test.jpg' } })),
      })),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
  useParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/reportes/nuevo'),
}));

describe('ReportForm Component', () => {
  test('renders the form with all type options', async () => {
    const ReportForm = (await import('@/components/ReportForm')).default;
    render(<ReportForm />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Tarea')).toBeInTheDocument();
    expect(screen.getByText('Mejora')).toBeInTheDocument();
  });

  test('renders title input field', async () => {
    const ReportForm = (await import('@/components/ReportForm')).default;
    render(<ReportForm />);

    const titleInput = screen.getByPlaceholderText('Describe el reporte en una línea');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveAttribute('type', 'text');
  });

  test('renders priority select field', async () => {
    const ReportForm = (await import('@/components/ReportForm')).default;
    render(<ReportForm />);

    const prioritySelect = screen.getByText('Seleccionar prioridad');
    expect(prioritySelect).toBeInTheDocument();
  });

  test('renders description textarea', async () => {
    const ReportForm = (await import('@/components/ReportForm')).default;
    render(<ReportForm />);

    const textarea = screen.getByPlaceholderText(
      'Describe el reporte en detalle. Incluye pasos para reproducir si es un error.'
    );
    expect(textarea).toBeInTheDocument();
  });

  test('renders submit button', async () => {
    const ReportForm = (await import('@/components/ReportForm')).default;
    render(<ReportForm />);

    const submitButton = screen.getByText('Crear Reporte');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  test('renders cancel button', async () => {
    const ReportForm = (await import('@/components/ReportForm')).default;
    render(<ReportForm />);

    const cancelButton = screen.getByText('Cancelar');
    expect(cancelButton).toBeInTheDocument();
  });
});
