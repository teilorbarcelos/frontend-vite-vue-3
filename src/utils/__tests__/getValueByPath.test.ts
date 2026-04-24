import { describe, it, expect } from 'vitest';
import { getValueByPath } from '../getValueByPath';

describe('getValueByPath', () => {
  it('resolves simple path', () => {
    expect(getValueByPath({ name: 'John' }, 'name')).toBe('John');
  });

  it('resolves nested path', () => {
    const obj = { user: { profile: { email: 'test@example.com' } } };
    expect(getValueByPath(obj, 'user.profile.email')).toBe('test@example.com');
  });

  it('returns undefined for non-existent path', () => {
    expect(getValueByPath({ a: 1 }, 'b')).toBeUndefined();
    expect(getValueByPath({ a: { b: 1 } }, 'a.c')).toBeUndefined();
  });

  it('returns undefined if object or path is missing', () => {
    expect(getValueByPath(null, 'a')).toBeUndefined();
    expect(getValueByPath({}, '')).toBeUndefined();
  });

  it('returns undefined if path is interrupted by null/undefined', () => {
    expect(getValueByPath({ a: null }, 'a.b')).toBeUndefined();
    expect(getValueByPath({ a: undefined }, 'a.b')).toBeUndefined();
  });
});
