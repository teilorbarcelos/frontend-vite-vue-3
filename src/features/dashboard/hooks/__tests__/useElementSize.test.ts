import { describe, it, expect, vi } from 'vitest';
import { useElementSize } from '../useElementSize';
import { ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';

describe('useElementSize', () => {
  it('observes element size and updates refs', async () => {
    let callback: any = null;
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    class MockResizeObserver {
      constructor(cb: any) {
        callback = cb;
      }
      observe = observeMock;
      unobserve = vi.fn();
      disconnect = disconnectMock;
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    const TestComp = {
      setup() {
        const target = ref<HTMLElement | null>(null);
        const { width, height } = useElementSize(target);
        return { target, width, height };
      },
      template: '<div ref="target"></div>'
    };

    const wrapper = mount(TestComp);
    await nextTick();

    expect(observeMock).toHaveBeenCalled();

    // Trigger ResizeObserver callback with valid dimensions
    callback([
      {
        contentRect: {
          width: 800,
          height: 600
        }
      }
    ]);

    expect(wrapper.vm.width).toBe(800);
    expect(wrapper.vm.height).toBe(600);

    // Trigger ResizeObserver callback with falsy/zero dimensions to test fallback
    callback([
      {
        contentRect: {
          width: 0,
          height: 0
        }
      }
    ]);
    expect(wrapper.vm.width).toBe(500);
    expect(wrapper.vm.height).toBe(300);

    // Unmount component to cover cleanup / disconnect call
    wrapper.unmount();
    expect(disconnectMock).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('does not crash and returns default values if elementRef is null', () => {
    const TestComp = {
      setup() {
        const target = ref<HTMLElement | null>(null);
        const { width, height } = useElementSize(target);
        return { width, height };
      },
      template: '<div></div>'
    };

    const wrapper = mount(TestComp);
    expect(wrapper.vm.width).toBe(500);
    expect(wrapper.vm.height).toBe(300);
    wrapper.unmount();
  });

  it('does not crash if ResizeObserver is undefined', () => {
    vi.stubGlobal('ResizeObserver', undefined);

    const TestComp = {
      setup() {
        const target = ref<HTMLElement | null>(null);
        const { width, height } = useElementSize(target);
        return { target, width, height };
      },
      template: '<div ref="target"></div>'
    };

    const wrapper = mount(TestComp);
    expect(wrapper.vm.width).toBe(500);
    expect(wrapper.vm.height).toBe(300);
    wrapper.unmount();

    vi.unstubAllGlobals();
  });

  it('handles empty entries or null entries in ResizeObserver callback', async () => {
    let callback: any = null;
    class MockResizeObserver {
      constructor(cb: any) {
        callback = cb;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    const TestComp = {
      setup() {
        const target = ref<HTMLElement | null>(null);
        const { width, height } = useElementSize(target);
        return { target, width, height };
      },
      template: '<div ref="target"></div>'
    };

    const wrapper = mount(TestComp);
    await nextTick();

    callback([]);
    expect(wrapper.vm.width).toBe(500);

    callback(null);
    expect(wrapper.vm.width).toBe(500);

    wrapper.unmount();
    vi.unstubAllGlobals();
  });
});
