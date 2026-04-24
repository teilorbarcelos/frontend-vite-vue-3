import {
  createMageSelectEngine,
  type MageSelectEngineConfig,
  type MageSelectEngineState
} from 'mage-select-data-engine';
import { onUnmounted, ref, watch } from 'vue';

export function useMageSelect<T extends { id: string | number }>(
  config: MageSelectEngineConfig<T>
) {
  const engine = createMageSelectEngine(config);
  const state = ref<MageSelectEngineState<T>>(engine.getState());

  const unsubscribe = engine.subscribe((newState) => {
    state.value = newState;
  });

  onUnmounted(() => {
    unsubscribe();
  });

  // Keep config in sync if it changes
  watch(
    () => config,
    (newConfig) => {
      engine.updateConfig(newConfig);
    },
    { deep: true }
  );

  return {
    state,
    engine
  };
}
