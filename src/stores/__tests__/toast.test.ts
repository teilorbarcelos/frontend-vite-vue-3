import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useToastStore } from '../toast';

describe('toast store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('adds a toast', () => {
    const store = useToastStore();
    store.success('Success message');
    
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0]).toMatchObject({
      description: 'Success message',
      variant: 'success',
    });
  });

  it('handles different toast types', () => {
    const store = useToastStore();
    store.error('Error message');
    expect(store.toasts[0].variant).toBe('error');
    
    store.info('Info message');
    expect(store.toasts[1].variant).toBe('info');
    
    store.warning('Warning message');
    expect(store.toasts[2].variant).toBe('warning');
  });

  it('removeToast method deletes specific toast', () => {
    const store = useToastStore();
    store.success('Message 1');
    const id = store.toasts[0].id;
    store.success('Message 2');
    
    store.removeToast(id);
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0].description).toBe('Message 2');
  });

  it('addToast adds a generic toast', () => {
    const store = useToastStore();
    store.addToast({ description: 'Generic', variant: 'default' });
    expect(store.toasts[0].variant).toBe('default');
  });
});
