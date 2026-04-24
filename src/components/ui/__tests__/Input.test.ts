import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import Input from '../Input.vue';

describe('Input', () => {
  it('renders correctly with label', () => {
    render(Input, {
      props: { label: 'Username', id: 'user-input' }
    });
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toHaveAttribute('id', 'user-input');
  });

  it('emits update:modelValue on input', async () => {
    const { emitted } = render(Input, {
      props: { modelValue: '' }
    });
    const input = screen.getByRole('textbox');
    await fireEvent.update(input, 'new value');
    expect(emitted()['update:modelValue']).toBeTruthy();
    expect(emitted()['update:modelValue'][0]).toEqual(['new value']);
  });

  it('shows error message and applies error styles', () => {
    render(Input, {
      props: { error: 'Invalid input' }
    });
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('uses generated ID if none provided', () => {
    render(Input, {
      props: { label: 'Username' }
    });
    const input = screen.getByRole('textbox');
    expect(input.id).toBeTruthy();
    expect(screen.getByText('Username')).toHaveAttribute('for', input.id);
  });
});
