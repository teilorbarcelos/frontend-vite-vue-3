import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportPdfButton from '../ExportPdfButton.vue';
import { downloadPdf } from '@/utils/download';

vi.mock('@/utils/download', () => ({
  downloadPdf: vi.fn()
}));

describe('ExportPdfButton', () => {
  const queryParams = {
    searchWord: 'test',
    searchFields: ['name'],
    filters: { active: true },
    sort: { orderBy: 'name', orderDirection: 'asc' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(ExportPdfButton, {
      props: {
        onExport: vi.fn(),
        queryParams
      }
    });
    const button = screen.getByRole('button', { name: /Exportar PDF/i });
    expect(button).toBeInTheDocument();
  });

  it('renders correctly with custom props', () => {
    render(ExportPdfButton, {
      props: {
        onExport: vi.fn(),
        queryParams,
        label: 'Download Report',
        filename: 'custom.pdf'
      }
    });
    const button = screen.getByRole('button', { name: /Download Report/i });
    expect(button).toBeInTheDocument();
  });

  it('triggers export and download flow successfully', async () => {
    const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' });
    const onExport = vi.fn().mockResolvedValue(mockBlob);

    render(ExportPdfButton, {
      props: {
        onExport,
        queryParams,
        filename: 'test-filename.pdf'
      }
    });

    const button = screen.getByRole('button', { name: /Exportar PDF/i });
    await fireEvent.click(button);

    expect(onExport).toHaveBeenCalledWith(queryParams);
    expect(downloadPdf).toHaveBeenCalledWith(mockBlob, 'test-filename.pdf');
  });

  it('handles error gracefully when export fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onExport = vi.fn().mockRejectedValue(new Error('Export failed'));

    render(ExportPdfButton, {
      props: {
        onExport,
        queryParams
      }
    });

    const button = screen.getByRole('button', { name: /Exportar PDF/i });
    await fireEvent.click(button);

    expect(onExport).toHaveBeenCalledWith(queryParams);
    expect(downloadPdf).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao exportar PDF:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
