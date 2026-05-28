import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ListPageHeader from '../ListPageHeader.vue';

describe('ListPageHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  it('renders title correctly', () => {
    render(ListPageHeader, {
      props: { title: 'Test Title', filterCount: 0 }
    });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('shows filter count when > 0', () => {
    render(ListPageHeader, {
      props: { title: 'Test', filterCount: 5 }
    });
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('emits filter-click on button click', async () => {
    const { emitted } = render(ListPageHeader, {
      props: { title: 'Test', filterCount: 0 }
    });
    const filterButton = screen.getByText('Filtros');
    await fireEvent.click(filterButton);
    expect(emitted()['filter-click']).toBeTruthy();
  });

  it('renders create button when onCreateClick is provided', async () => {
    const onCreateClick = vi.fn();
    render(ListPageHeader, {
      props: { title: 'Test', filterCount: 0, onCreateClick, createLabel: 'Create New' }
    });
    const createButton = screen.getByText('Create New');
    await fireEvent.click(createButton);
    expect(onCreateClick).toHaveBeenCalled();
  });

  it('does not render create button when onCreateClick is not provided', () => {
    render(ListPageHeader, {
      props: { title: 'Test', filterCount: 0 }
    });
    expect(screen.queryByRole('button', { name: /Novo/i })).not.toBeInTheDocument();
  });

  it('emits search event when search input changes', async () => {
    const { emitted } = render(ListPageHeader, {
      props: { title: 'Test', filterCount: 0 }
    });

    const searchInput = screen.getByPlaceholderText(/Pesquisar/i);
    await fireEvent.update(searchInput, 'new search');

    // Search is debounced (500ms)
    await vi.advanceTimersByTime(500);

    expect(emitted().search).toBeTruthy();
    expect(emitted().search[0]).toEqual(['new search']);
  });
});
