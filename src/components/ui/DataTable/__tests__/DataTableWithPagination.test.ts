import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import DataTableWithPagination from '../DataTableWithPagination.vue';

describe('DataTableWithPagination', () => {
  const headerMap = [
    { keyItem: 'name', title: 'Name' },
    { keyItem: 'age', title: 'Age' }
  ];

  const data = Array.from({ length: 15 }, (_, i) => ({
    id: `${i}`,
    name: `User ${i}`,
    age: 20 + i
  }));

  it('renders table and pagination', () => {
    render(DataTableWithPagination, {
      props: {
        headerMap,
        data,
        pageSize: 10
      }
    });

    expect(screen.getByText('User 0')).toBeInTheDocument();
    expect(screen.getByText('User 9')).toBeInTheDocument();
    // Use a more robust selector that works regardless of sm: hidden/flex
    expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
  });

  it('triggers page change', async () => {
    const manyData = Array.from({ length: 25 }, (_, i) => ({
      id: `${i}`,
      name: `User ${i}`,
      age: 20 + i
    }));
    render(DataTableWithPagination, {
      props: {
        headerMap,
        data: manyData,
        pageSize: 10
      }
    });

    const nextButton = screen.getByTitle('Próximo');
    await fireEvent.click(nextButton);
    expect(screen.getByText('User 10')).toBeInTheDocument();
  });

  it('renders empty state when no data is provided', () => {
    render(DataTableWithPagination, {
      props: {
        headerMap,
        data: []
      }
    });

    expect(screen.getByText(/Nenhum registro encontrado/i)).toBeInTheDocument();
  });
});
