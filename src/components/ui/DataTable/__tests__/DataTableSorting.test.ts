import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import DataTable from '../DataTable.vue';

describe('DataTable Sorting', () => {
  const headerMap = [
    { keyItem: 'name', title: 'Name', sortable: true },
    { keyItem: 'age', title: 'Age', sortable: false }
  ];

  const data = [
    { id: '1', name: 'John', age: 30 },
    { id: '2', name: 'Jane', age: 25 }
  ];

  it('triggers sorting when a sortable header is clicked', async () => {
    const onChange = vi.fn();
    render(DataTable, {
      props: {
        headerMap,
        data,
        sorting: {
          value: { orderBy: 'name', orderDirection: 'asc' },
          onChange
        }
      }
    });

    const nameHeader = screen.getByText('Name');
    await fireEvent.click(nameHeader);

    expect(onChange).toHaveBeenCalledWith({
      orderBy: 'name',
      orderDirection: 'desc'
    });
  });

  it('does not trigger sorting when a non-sortable header is clicked', async () => {
    const onChange = vi.fn();
    render(DataTable, {
      props: {
        headerMap,
        data,
        sorting: {
          value: { orderBy: 'name', orderDirection: 'asc' },
          onChange
        }
      }
    });

    const ageHeader = screen.getByText('Age');
    await fireEvent.click(ageHeader);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('rotates sorting direction (asc -> desc -> undefined)', async () => {
    const onChange = vi.fn();

    // Test desc -> undefined
    const { rerender } = render(DataTable, {
      props: {
        headerMap,
        data,
        sorting: {
          value: { orderBy: 'name', orderDirection: 'desc' },
          onChange
        }
      }
    });

    await fireEvent.click(screen.getByText('Name'));
    expect(onChange).toHaveBeenCalledWith({
      orderBy: undefined,
      orderDirection: undefined
    });

    // Test undefined -> asc
    onChange.mockClear();
    await rerender({
      sorting: {
        value: { orderBy: undefined, orderDirection: undefined },
        onChange
      }
    });

    await fireEvent.click(screen.getByText('Name'));
    expect(onChange).toHaveBeenCalledWith({
      orderBy: 'name',
      orderDirection: 'asc'
    });
  });
});
