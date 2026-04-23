import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import Input from '../Input.vue';

describe('Input', () => {
  it('renders correctly with label', () => {
    render(Input, {
      props: {
        label: 'Email',
        id: 'email-input',
      },
    });
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email-input');
  });

  it('shows error message when provided', () => {
    render(Input, {
      props: {
        error: 'Required field',
      },
    });
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('emits update:modelValue on input', async () => {
    const { emitted } = render(Input, {
      props: {
        modelValue: '',
      },
    });
    const input = screen.getByRole('textbox');
    await fireEvent.update(input, 'test@example.com');
    expect(emitted()['update:modelValue']).toBeTruthy();
    expect(emitted()['update:modelValue'][0]).toEqual(['test@example.com']);
  });

  it('applies custom classes', () => {
    render(Input, {
      props: {
        class: 'custom-class',
      },
    });
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });
});
