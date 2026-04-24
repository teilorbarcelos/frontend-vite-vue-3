import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import FilterDrawer, { type FilterField } from '../FilterDrawer.vue';

describe('FilterDrawer', () => {
  const fields: FilterField[] = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [{ label: 'Ativo', value: 'active' }]
    },
    { name: 'name', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' },
    { name: 'created_at', label: 'Data', type: 'dateRange' }
  ];

  it('renders correctly when open', async () => {
    render(FilterDrawer, {
      props: {
        isOpen: true,
        fields
      }
    });

    expect(await screen.findByText('Filtros Avançados')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
  });

  it('initializes form with initialValues', async () => {
    const initialValues = {
      status: 'active',
      name: 'Test',
      created_at_start: '2024-01-01',
      created_at_end: '2024-01-02'
    };

    render(FilterDrawer, {
      props: {
        isOpen: true,
        fields,
        initialValues
      }
    });

    expect(await screen.findByDisplayValue('Ativo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
  });

  it('emits filter event on submit', async () => {
    const { emitted } = render(FilterDrawer, {
      props: {
        isOpen: true,
        fields
      }
    });

    const nameInput = await screen.findByPlaceholderText('Filtrar por nome');
    await fireEvent.update(nameInput, 'New Value');

    const applyButton = screen.getByText('Aplicar');
    await fireEvent.click(applyButton);

    expect(emitted().filter).toBeTruthy();
    const filterEvents = emitted().filter as any[][];
    expect(filterEvents[0][0]).toEqual({ name: 'New Value' });
    expect(emitted().close).toBeTruthy();
  });

  it('emits filter with empty object on reset', async () => {
    const { emitted } = render(FilterDrawer, {
      props: {
        isOpen: true,
        fields
      }
    });

    const resetButton = await screen.findByText('Limpar');
    await fireEvent.click(resetButton);

    expect(emitted().filter).toBeTruthy();
    const filterEvents = emitted().filter as any[][];
    expect(filterEvents[0][0]).toEqual({});
    expect(emitted().close).toBeTruthy();
  });

  it('handles dateRange fields correctly', async () => {
    render(FilterDrawer, {
      props: {
        isOpen: true,
        fields: [{ name: 'created_at', label: 'Date', type: 'dateRange' }]
      }
    });

    expect(await screen.findByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Selecione um período')).toBeInTheDocument();
  });
});
