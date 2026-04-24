import { mount } from '@vue/test-utils';
import { createMageSelectEngine } from 'mage-select-data-engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, reactive } from 'vue';
import { useMageSelect } from '../useMageSelect';

vi.mock('mage-select-data-engine', () => ({
  createMageSelectEngine: vi.fn()
}));

describe('useMageSelect', () => {
  const config = {
    fetchData: vi.fn().mockResolvedValue({ items: [], total: 0 })
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(createMageSelectEngine).mockImplementation((_) => {
      const state = { selectedItems: [], items: [], isLoading: false, search: '', hasMore: false };
      return {
        getState: () => state,
        subscribe: vi.fn().mockReturnValue(vi.fn()),
        updateConfig: vi.fn()
      } as any;
    });
  });

  it('initializes engine and state', () => {
    const { state, engine } = useMageSelect(config as any);
    expect(state.value).toBeDefined();
    expect(engine).toBeDefined();
  });

  it('updates config when reactive config changes', async () => {
    const fetchFn = vi.fn();
    const configObj = reactive({ fetchData: fetchFn });

    const { engine } = useMageSelect(configObj as any);
    const spy = vi.spyOn(engine, 'updateConfig');

    configObj.fetchData = vi.fn();
    await nextTick();

    expect(spy).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const unsubscribeSpy = vi.fn();
    const subscribeSpy = vi.fn().mockReturnValue(unsubscribeSpy);

    vi.mocked(createMageSelectEngine).mockReturnValue({
      getState: vi.fn().mockReturnValue({}),
      subscribe: subscribeSpy,
      updateConfig: vi.fn()
    } as any);

    const TestComponent = defineComponent({
      setup() {
        const { engine } = useMageSelect(config as any);
        return { engine };
      },
      template: '<div></div>'
    });

    const wrapper = mount(TestComponent);
    wrapper.unmount();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
