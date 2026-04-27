import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { defineComponent } from 'vue';

// Mock IntersectionObserver to allow manual triggering in tests
const observers = new Set<IntersectionObserverMock>();

class IntersectionObserverMock {
  callback: IntersectionObserverCallback;
  elements: Set<Element> = new Set();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observers.add(this);
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
    observers.delete(this);
  }
}

// Global helper to trigger intersection
(globalThis as any).fireIntersection = (isIntersecting: boolean) => {
  observers.forEach((observer) => {
    observer.callback(
      [{ isIntersecting, target: Array.from(observer.elements)[0] }] as IntersectionObserverEntry[],
      observer as unknown as IntersectionObserver
    );
  });
};

(globalThis as any).clearObservers = () => {
  observers.clear();
};

// Radix UI mocks
if (typeof window !== 'undefined') {
  // @ts-expect-error - mock PointerEvent
  window.PointerEvent = class PointerEvent extends MouseEvent {
    pointerId: number;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
    }
  };

  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();

  class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  window.ResizeObserver = ResizeObserverMock;
}

if (typeof (globalThis as any).process !== 'undefined') {
  (globalThis as any).process.on('unhandledRejection', (reason: any) => {
    if (reason instanceof TypeError && reason.message.includes('focus')) {
      return;
    }
  });
}

vi.mock('radix-vue', async (importOriginal) => {
  const original = await importOriginal<typeof import('radix-vue')>();
  return {
    ...original,
    FocusScope: defineComponent({
      name: 'FocusScope',
      setup(_, { slots }) {
        return () => slots.default?.();
      }
    })
  };
});

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock
});
