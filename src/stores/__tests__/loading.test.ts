import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLoadingStore } from '../loading';

describe('Loading Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should have initial state', () => {
    const store = useLoadingStore();
    expect(store.isLoading).toBe(false);
    expect(store.message).toBe('Carregando...');
  });

  it('should show loading with default message', () => {
    const store = useLoadingStore();
    store.showLoading();
    expect(store.isLoading).toBe(true);
    expect(store.message).toBe('Carregando...');
  });

  it('should show loading with custom message', () => {
    const store = useLoadingStore();
    store.showLoading('Testing...');
    expect(store.isLoading).toBe(true);
    expect(store.message).toBe('Testing...');
  });

  it('should hide loading', () => {
    const store = useLoadingStore();
    store.showLoading();
    store.hideLoading();
    expect(store.isLoading).toBe(false);
  });
});
