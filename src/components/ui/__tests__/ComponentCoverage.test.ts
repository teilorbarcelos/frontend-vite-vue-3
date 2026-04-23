import { render, screen } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';
import Pagination from '../DataTable/Pagination.vue';
import Input from '../Input.vue';

describe('UI Component Edge Cases', () => {
  it('Input with error', () => {
    render(Input, { 
      props: { error: 'This is required' }
    });
    expect(screen.getByText('This is required')).toBeInTheDocument();
  });

  it('Pagination with one page but pageSizeChange', () => {
    render(Pagination, {
      props: {
        currentPage: 0,
        totalPages: 1,
        pageSize: 10,
        totalItems: 1,
        onPageSizeChange: vi.fn(),
        onPageChange: vi.fn()
      }
    });
    expect(screen.getByText(/Exibindo/)).toBeInTheDocument();
  });

  it('Pagination with multiple pages', () => {
    render(Pagination, {
      props: {
        currentPage: 0,
        totalPages: 10,
        onPageChange: vi.fn()
      }
    });
    expect(screen.getByText(/Página/)).toBeInTheDocument();
  });
});
