import { render, screen, fireEvent } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Pagination from '../Pagination.vue';

describe('Pagination', () => {
  it('renders correctly with multiple pages', () => {
    render(Pagination, {
      props: {
        currentPage: 0,
        totalPages: 10,
        pageSize: 10,
        onPageChange: vi.fn()
      }
    });

    expect(screen.getByText(/Página/)).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);

    expect(screen.getByTitle('Próximo')).not.toBeDisabled();
    expect(screen.getByTitle('Anterior')).toBeDisabled();
  });

  it('calls onPageChange when page button is clicked', async () => {
    const onPageChange = vi.fn();
    render(Pagination, {
      props: {
        currentPage: 0,
        totalPages: 10,
        pageSize: 10,
        onPageChange: onPageChange
      }
    });

    const page2Buttons = screen.getAllByText('2');
    await fireEvent.click(page2Buttons[0]);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('navigates to first and last pages', async () => {
    const onPageChange = vi.fn();
    render(Pagination, {
      props: {
        currentPage: 5,
        totalPages: 10,
        pageSize: 10,
        onPageChange: onPageChange
      }
    });

    await fireEvent.click(screen.getByTitle('Primeira página'));
    expect(onPageChange).toHaveBeenCalledWith(0);

    await fireEvent.click(screen.getByTitle('Última página'));
    expect(onPageChange).toHaveBeenCalledWith(9);
  });

  it('triggers mobile buttons', async () => {
    const onPageChange = vi.fn();
    const { container } = render(Pagination, {
      props: {
        currentPage: 1,
        totalPages: 10,
        pageSize: 10,
        onPageChange: onPageChange
      }
    });

    // Mobile buttons are in sm:hidden div (the first buttons in the container)
    const buttons = container.querySelectorAll('button');
    // In our structure, index 0 is mobile "Anterior", index 1 is mobile "Próximo"
    await fireEvent.click(buttons[0]);
    expect(onPageChange).toHaveBeenCalledWith(0);

    await fireEvent.click(buttons[1]);
    expect(onPageChange).toHaveBeenCalledWith(2);

    // Desktop buttons
    await fireEvent.click(screen.getByTitle('Anterior'));
    expect(onPageChange).toHaveBeenCalledWith(0);

    await fireEvent.click(screen.getByTitle('Próximo'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('updates page size when selected from dropdown', async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    const onPageChange = vi.fn();
    render(Pagination, {
      props: {
        currentPage: 0,
        totalPages: 10,
        onPageChange: onPageChange,
        pageSize: 25,
        onPageSizeChange: onPageSizeChange
      }
    });

    const pageSizeTrigger = screen.getByText('25');
    await user.click(pageSizeTrigger);

    const option50 = await screen.findByText('50');
    await user.click(option50);

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it('does not render root div if only one page and no pageSizeChange', () => {
    const { container } = render(Pagination, {
      props: {
        currentPage: 0,
        totalPages: 1,
        pageSize: 10,
        onPageChange: vi.fn()
      }
    });

    expect(container.querySelector('div')).not.toBeInTheDocument();
  });

  it('displays "Exibindo" text when totalItems is provided', () => {
    render(Pagination, {
      props: {
        currentPage: 0,
        totalPages: 5,
        totalItems: 50,
        pageSize: 10,
        onPageChange: vi.fn()
      }
    });

    expect(screen.getByText(/Exibindo/)).toBeInTheDocument();
    expect(screen.getByText(/Exibindo/)).toHaveTextContent('Exibindo 1 até 10 de 50');
  });

  it('displays "Exibindo" text on last page to cover Math.min branches', () => {
    render(Pagination, {
      props: {
        currentPage: 4,
        totalPages: 5,
        totalItems: 45,
        pageSize: 10,
        onPageChange: vi.fn()
      }
    });

    expect(screen.getByText(/Exibindo/)).toHaveTextContent('Exibindo 41 até 45 de 45');
  });

  it('handles page change with out-of-range values', async () => {
    const onPageChange = vi.fn();
    render(Pagination, {
      props: {
        currentPage: 0,
        totalPages: 10,
        pageSize: 10,
        onPageChange: onPageChange
      }
    });

    const anteriorButton = screen.getByTitle('Anterior');
    // fireEvent can trigger even if disabled in JSDOM, but we want to ensure
    // handlePageChange's internal check prevents the call
    await fireEvent.click(anteriorButton);
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
