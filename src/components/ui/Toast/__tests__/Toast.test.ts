import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import ToastProvider from '../ToastProvider.vue';
import ToastIcon from '../ToastIcon.vue';
import { useToastStore } from '@/stores/toast';

describe('Toast Component System', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  it('renders toasts from the store', async () => {
    const toastStore = useToastStore();
    render(ToastProvider);

    toastStore.addToast({
      title: 'Success Toast',
      description: 'Toast Description',
      variant: 'success'
    });

    await nextTick();

    await waitFor(() => {
      expect(screen.getByText('Success Toast')).toBeInTheDocument();
      expect(screen.getByText('Toast Description')).toBeInTheDocument();
    });
  });

  it('removes toast after timeout when closed', async () => {
    const toastStore = useToastStore();
    render(ToastProvider);

    toastStore.addToast({
      title: 'Removable Toast',
      variant: 'default'
    });

    await nextTick();

    const toast = await waitFor(() => screen.getByText('Removable Toast'));
    expect(toast).toBeInTheDocument();

    // Find close button and click it
    // Radix ToastClose usually renders a button.
    const closeButton = screen.getByRole('button');
    await fireEvent.click(closeButton);

    // Should wait for the 500ms timeout in handleOpenChange
    vi.advanceTimersByTime(600);

    expect(toastStore.toasts).toHaveLength(0);
  });

  it('ToastIcon renders different variants', async () => {
    const { rerender } = render(ToastIcon, { props: { variant: 'success' } });
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();

    await rerender({ variant: 'error' });
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();

    await rerender({ variant: 'warning' });
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();

    await rerender({ variant: 'info' });
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();

    await rerender({ variant: 'default' });
  });

  it('handles store shorthand methods', () => {
    const toastStore = useToastStore();
    toastStore.success('Success message');
    toastStore.error('Error message');
    toastStore.info('Info message');
    toastStore.warning('Warning message');

    expect(toastStore.toasts).toHaveLength(4);
    expect(toastStore.toasts[0].variant).toBe('success');
    expect(toastStore.toasts[1].variant).toBe('error');
    expect(toastStore.toasts[2].variant).toBe('info');
    expect(toastStore.toasts[3].variant).toBe('warning');
  });

  it('ToastProvider handles toasts without titles or descriptions', async () => {
    const toastStore = useToastStore();
    render(ToastProvider);

    toastStore.addToast({
      description: 'Only Description',
      variant: 'default'
    });

    await nextTick();
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Only Description')).toBeInTheDocument();
  });

  it('ToastProvider handleOpenChange covers false branch', async () => {
    const toastStore = useToastStore();
    render(ToastProvider);

    toastStore.addToast({ title: 'Manual' });
    await nextTick();

    // Find the close button and click it to trigger handleOpenChange(false)
    const closeButton = await screen.findByRole('button');
    await fireEvent.click(closeButton);

    vi.advanceTimersByTime(600);
    expect(toastStore.toasts).toHaveLength(0);
  });

  it('covers handleOpenChange with true', async () => {
    const toastStore = useToastStore();
    const wrapper = mount(ToastProvider);

    toastStore.addToast({
      id: 'test-id',
      title: 'Test Toast',
      variant: 'default'
    });

    await nextTick();

    const ToastRoot = (await import('../ToastRoot.vue')).default;
    const root = wrapper.findComponent(ToastRoot);
    if (root.exists()) {
      root.vm.$emit('update:open', true);
    }

    expect(toastStore.toasts).toHaveLength(1);
  });
});
