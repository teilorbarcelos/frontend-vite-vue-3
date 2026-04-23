import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import Calendar from '../Calendar.vue';

describe('Calendar', () => {
  it('renders correctly', () => {
    render(Calendar);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('handles date selection', async () => {
    const onUpdateModelValue = vi.fn();
    
    render(Calendar, {
      props: {
        'onUpdate:modelValue': onUpdateModelValue
      }
    });

    const day15 = screen.getByText('15');
    const button = day15.closest('button');
    
    if (button) {
      await fireEvent.click(button);
    } else {
      await fireEvent.click(day15);
    }
    
    await nextTick();
    
    await waitFor(() => {
      expect(onUpdateModelValue).toHaveBeenCalled();
    });
  });
});
