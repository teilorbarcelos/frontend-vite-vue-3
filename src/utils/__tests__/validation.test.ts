import { describe, it, expect } from 'vitest';
import { getRolePermissions, isPageInRange, formatDateRange } from '../validation';

describe('validation utils', () => {
  describe('getRolePermissions', () => {
    it('returns empty array if role is null', () => {
      expect(getRolePermissions(null)).toEqual([]);
    });

    it('returns empty array if permissions is missing', () => {
      expect(getRolePermissions({} as any)).toEqual([]);
    });

    it('returns permissions array if it exists', () => {
      const permissions = [{ feature: 'test' }];
      expect(getRolePermissions({ permissions } as any)).toEqual(permissions);
    });
  });

  describe('isPageInRange', () => {
    it('returns false for negative page', () => {
      expect(isPageInRange(-1, 10)).toBe(false);
    });

    it('returns false for page >= totalPages', () => {
      expect(isPageInRange(10, 10)).toBe(false);
      expect(isPageInRange(11, 10)).toBe(false);
    });

    it('returns true for valid page', () => {
      expect(isPageInRange(0, 10)).toBe(true);
      expect(isPageInRange(5, 10)).toBe(true);
      expect(isPageInRange(9, 10)).toBe(true);
    });
  });

  describe('formatDateRange', () => {
    it('formats from and to dates', () => {
      const from = new Date(2023, 0, 1);
      const to = new Date(2023, 0, 2);
      const result = formatDateRange('created_at', from, to);
      expect(result).toEqual({
        created_at_start: '2023-01-01',
        created_at_end: '2023-01-02'
      });
    });

    it('uses from date for end if to is missing', () => {
      const from = new Date(2023, 0, 1);
      const result = formatDateRange('created_at', from);
      expect(result).toEqual({
        created_at_start: '2023-01-01',
        created_at_end: '2023-01-01'
      });
    });
  });
});
