import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button.vue';

describe('Button', () => {
  it('renders correctly with default slot', () => {
    render(Button, {
      slots: { default: 'Click me' }
    });
    expect(screen.getByRole('button', { name: /Click me/i })).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(Button, {
      props: { variant: 'secondary' },
      slots: { default: 'Button' }
    });
    // Check for some secondary variant class (from button-variants.ts)
    // Assuming secondary has some specific background or border
    expect(screen.getByRole('button')).toHaveClass('bg-gray-100');
  });

  it('emits click event', async () => {
    const onClick = vi.fn();
    render(Button, {
      attrs: { onClick },
      slots: { default: 'Button' }
    });
    await fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('is disabled when disabled attr is provided', () => {
    render(Button, {
      attrs: { disabled: true },
      slots: { default: 'Button' }
    });
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
