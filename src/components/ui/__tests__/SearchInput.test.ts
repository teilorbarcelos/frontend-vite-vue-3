import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchInput from '../SearchInput.vue';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders correctly with placeholder', () => {
    render(SearchInput, {
      props: { placeholder: 'Custom Placeholder' }
    });
    expect(screen.getByPlaceholderText('Custom Placeholder')).toBeInTheDocument();
  });

  it('emits search event after debounce', async () => {
    const { emitted } = render(SearchInput);
    const input = screen.getByPlaceholderText('Pesquisar...');

    await fireEvent.update(input, 'test query');

    // Should not emit immediately
    expect(emitted().search).toBeUndefined();

    // Fast forward time
    vi.advanceTimersByTime(500);

    expect(emitted().search).toBeTruthy();
    expect(emitted().search[0]).toEqual(['test query']);
  });

  it('clears input when clear button is clicked', async () => {
    const { emitted } = render(SearchInput, {
      props: { defaultValue: 'initial' }
    });

    const clearButton = screen.getByRole('button');
    await fireEvent.click(clearButton);

    expect(screen.getByPlaceholderText('Pesquisar...')).toHaveValue('');
    expect(emitted().search).toBeTruthy();
    expect(emitted().search[0]).toEqual(['']);
  });

  it('updates timeout on subsequent typing', async () => {
    const { emitted } = render(SearchInput);
    const input = screen.getByPlaceholderText('Pesquisar...');

    await fireEvent.update(input, 'te');
    vi.advanceTimersByTime(200);
    await fireEvent.update(input, 'test');
    vi.advanceTimersByTime(300);

    // Should not have emitted yet because timer was reset
    expect(emitted().search).toBeUndefined();

    vi.advanceTimersByTime(200);
    expect(emitted().search).toBeTruthy();
    expect(emitted().search[0]).toEqual(['test']);
  });
});
