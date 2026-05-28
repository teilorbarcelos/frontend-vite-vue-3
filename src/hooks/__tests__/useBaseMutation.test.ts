import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBaseMutation } from '../useBaseMutation';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { useLoadingStore } from '@/stores/loading';
import { useToastStore } from '@/stores/toast';
import { AxiosError } from 'axios';

describe('useBaseMutation', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it('shows loading label when showLoadingLabel is provided', async () => {
    const loadingStore = useLoadingStore();
    const showLoadingSpy = vi.spyOn(loadingStore, 'showLoading');

    const TestComponent = defineComponent({
      setup() {
        const mutation = useBaseMutation({
          mutationFn: () => Promise.resolve(),
          showLoadingLabel: 'Loading...'
        });
        return { mutation };
      },
      template: '<div></div>'
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]]
      }
    });

    await (wrapper.vm as any).mutation.mutateAsync();
    expect(showLoadingSpy).toHaveBeenCalledWith('Loading...');
  });

  it('calls onError callback', async () => {
    const onError = vi.fn();
    const error = { response: { data: { message: 'Error' } } } as AxiosError<{ message: string }>;

    const TestComponent = defineComponent({
      setup() {
        const mutation = useBaseMutation({
          mutationFn: () => Promise.reject(error),
          onError
        });
        return { mutation };
      },
      template: '<div></div>'
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]]
      }
    });

    try {
      await (wrapper.vm as any).mutation.mutateAsync();
    } catch (e: any) {
      expect(e).toBeDefined();
    }

    expect(onError).toHaveBeenCalledWith(error, undefined, undefined, expect.any(Object));
  });

  it('handles network error in onError', async () => {
    const error = { code: 'ERR_NETWORK', response: undefined } as AxiosError<{ message?: string }>;
    const toastStore = useToastStore();
    const errorSpy = vi.spyOn(toastStore, 'error');

    const TestComponent = defineComponent({
      setup() {
        const mutation = useBaseMutation({
          mutationFn: () => Promise.reject(error)
        });
        return { mutation };
      },
      template: '<div></div>'
    });

    const wrapper = mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] }
    });

    try {
      await (wrapper.vm as any).mutation.mutateAsync();
    } catch (e: any) {
      expect(e).toBeDefined();
    }

    expect(errorSpy).toHaveBeenCalledWith(
      'O servidor está offline. Por favor, verifique sua conexão.'
    );
  });

  it('handles unexpected error in onError', async () => {
    const error = { response: undefined } as AxiosError<{ message?: string }>;
    const toastStore = useToastStore();
    const errorSpy = vi.spyOn(toastStore, 'error');

    const TestComponent = defineComponent({
      setup() {
        const mutation = useBaseMutation({
          mutationFn: () => Promise.reject(error)
        });
        return { mutation };
      },
      template: '<div></div>'
    });

    const wrapper = mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] }
    });

    try {
      await (wrapper.vm as any).mutation.mutateAsync();
    } catch (e: any) {
      expect(e).toBeDefined();
    }

    expect(errorSpy).toHaveBeenCalledWith('Ocorreu um erro inesperado.');
  });

  it('calls onMutate and returns context', async () => {
    const onMutate = vi.fn().mockReturnValue({ test: true });
    const TestComponent = defineComponent({
      setup() {
        const mutation = useBaseMutation({
          mutationFn: () => Promise.resolve(),
          onMutate
        });
        return { mutation };
      },
      template: '<div></div>'
    });

    const wrapper = mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] }
    });

    await (wrapper.vm as any).mutation.mutateAsync('vars');
    expect(onMutate).toHaveBeenCalledWith('vars', expect.anything());
  });

  it('calls onSettled callback', async () => {
    const onSettled = vi.fn();
    const TestComponent = defineComponent({
      setup() {
        const mutation = useBaseMutation({
          mutationFn: () => Promise.resolve('data'),
          onSettled
        });
        return { mutation };
      },
      template: '<div></div>'
    });

    const wrapper = mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] }
    });

    await (wrapper.vm as any).mutation.mutateAsync();
    expect(onSettled).toHaveBeenCalledWith('data', null, undefined, undefined, expect.anything());
  });

  it('calls successMessage as a function', async () => {
    const toastStore = useToastStore();
    const successSpy = vi.spyOn(toastStore, 'success');
    const successFn = vi
      .fn()
      .mockImplementation((data, variables) => `Success: ${data} with ${variables}`);

    const TestComponent = defineComponent({
      setup() {
        const mutation = useBaseMutation({
          mutationFn: (vars: string) => Promise.resolve('res-data'),
          successMessage: successFn
        });
        return { mutation };
      },
      template: '<div></div>'
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]]
      }
    });

    await (wrapper.vm as any).mutation.mutateAsync('vars-data');
    expect(successFn).toHaveBeenCalledWith('res-data', 'vars-data');
    expect(successSpy).toHaveBeenCalledWith('Success: res-data with vars-data');
  });
});
