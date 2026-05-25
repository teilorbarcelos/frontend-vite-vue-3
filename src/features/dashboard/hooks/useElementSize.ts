import { ref, onMounted, onUnmounted, type Ref } from 'vue';

export function useElementSize(elementRef: Ref<HTMLElement | null>): {
  width: Ref<number>;
  height: Ref<number>;
} {
  const width = ref(500);
  const height = ref(300);
  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    if (!elementRef.value) return;
    if (typeof ResizeObserver === 'undefined') return;

    resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: w, height: h } = entries[0].contentRect;
      width.value = w || 500;
      height.value = h || 300;
    });

    resizeObserver.observe(elementRef.value);
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  return { width, height };
}
