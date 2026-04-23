import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SearchInput from '../SearchInput.vue';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with placeholder', () => {
    render(SearchInput, { props: { onSearch: () => {}, placeholder: 'Search here...' } });
    expect(screen.getByPlaceholderText('Search here...')).toBeInTheDocument();
  });

  it('calls onSearch with debounce', async () => {
    const onSearch = vi.fn();
    render(SearchInput, { props: { onSearch } });
    const input = screen.getByPlaceholderText('Pesquisar...');

    await fireEvent.update(input, 'test');
    
    // Should not be called immediately
    expect(onSearch).not.toHaveBeenCalled();

    // Advance time by 500ms
    vi.advanceTimersByTime(500);

    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('clears input and calls onSearch immediately', async () => {
    const onSearch = vi.fn();
    // Use defaultValue instead of modelValue
    render(SearchInput, { props: { onSearch, defaultValue: 'initial' } });
    
    const clearButton = screen.getByRole('button');
    await fireEvent.click(clearButton);

    expect(screen.getByPlaceholderText('Pesquisar...')).toHaveValue('');
    expect(onSearch).toHaveBeenCalledWith('');
  });
});
