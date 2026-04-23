import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../StatusBadge.vue';
import { createPinia, setActivePinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createTestQueryClient } from '@/test/test-utils';

describe('StatusBadge', () => {
  it('renders "Ativo" when active is true', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    render(StatusBadge, {
      props: { active: true, feature: 'product' },
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient: createTestQueryClient() }]]
      }
    });
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('renders "Inativo" when active is false', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    render(StatusBadge, {
      props: { active: false, feature: 'product' },
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient: createTestQueryClient() }]]
      }
    });
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('emits click when has permission', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['auth-user'], {
      id: '1',
      name: 'Test',
      role: { permissions: [{ feature: 'product', activate: true }] }
    });

    const pinia = createPinia();
    setActivePinia(pinia);

    const { emitted } = render(StatusBadge, {
      props: { active: true, feature: 'product' },
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient }]]
      }
    });

    const button = screen.getByRole('button');
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    await fireEvent.click(button);
    expect(emitted().click).toBeTruthy();
  });

  it('does not emit click and is disabled when no permission', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['auth-user'], {
      id: '1',
      name: 'Test',
      role: { permissions: [{ feature: 'product', activate: false }] }
    });

    const pinia = createPinia();
    setActivePinia(pinia);

    const { emitted } = render(StatusBadge, {
      props: { active: true, feature: 'product' },
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient }]]
      }
    });

    const button = screen.getByRole('button');
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    expect(button).toHaveClass('cursor-not-allowed');

    await fireEvent.click(button);
    expect(emitted().click).toBeUndefined();
  });
});
