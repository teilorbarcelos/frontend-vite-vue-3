import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMutationRegistry } from '../MutationRegistry';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

vi.mock('@/lib/axios', () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  }
}));

// Mock service
const mockService = {
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  toggleStatus: vi.fn()
};

describe('MutationRegistry', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  const registry = createMutationRegistry({
    queryKey: 'users',
    service: mockService as any,
    name: 'user'
  });

  const TestComponent = defineComponent({
    setup() {
      const saveMutation = registry.useSave(false);
      const deleteMutation = registry.useDelete();
      const toggleMutation = registry.useToggleStatus();
      return { saveMutation, deleteMutation, toggleMutation };
    },
    template: '<div></div>'
  });

  it('useSave calls create method when not editing', async () => {
    mockService.createUser.mockResolvedValueOnce({ id: '1', name: 'New User' });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]]
      }
    });

    await (wrapper.vm as any).saveMutation.mutateAsync({ name: 'New User' });
    expect(mockService.createUser).toHaveBeenCalledWith({ name: 'New User' });
  });

  it('useSave calls update method when editing', async () => {
    mockService.updateUser.mockResolvedValueOnce({ id: '1', name: 'Updated' });

    const EditComponent = defineComponent({
      setup() {
        const saveMutation = registry.useSave(true, '1');
        return { saveMutation };
      },
      template: '<div></div>'
    });

    const wrapper = mount(EditComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]]
      }
    });

    await (wrapper.vm as any).saveMutation.mutateAsync({ name: 'Updated' });
    expect(mockService.updateUser).toHaveBeenCalledWith('1', { name: 'Updated' });
  });

  it('useDelete calls delete method', async () => {
    mockService.deleteUser.mockResolvedValueOnce(undefined);

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]]
      }
    });

    await (wrapper.vm as any).deleteMutation.mutateAsync('1');
    expect(mockService.deleteUser).toHaveBeenCalledWith('1');
  });

  it('useToggleStatus calls toggleStatus method', async () => {
    mockService.toggleStatus.mockResolvedValueOnce(undefined);

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]]
      }
    });

    await (wrapper.vm as any).toggleMutation.mutateAsync({ id: '1', active: true });
    expect(mockService.toggleStatus).toHaveBeenCalledWith('1', true);
  });
});
