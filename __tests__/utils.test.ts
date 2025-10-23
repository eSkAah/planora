import { describe, expect, it, jest } from '@jest/globals';

import {
  cn,
  formatDate,
  formatDateShort,
  capitalize,
  truncate,
  generateId,
  debounce,
  isEmpty,
} from '@/lib/utils/index';

describe('Utility functions', () => {
  describe('cn (className utility)', () => {
    it('should merge classes correctly', () => {
      expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe(
        'base-class conditional-class'
      );
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class');
    });
  });

  describe('formatDate', () => {
    it('should format date to French locale', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toBe('15 janvier 2024');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-12-25');
      expect(formatted).toBe('25 décembre 2024');
    });
  });

  describe('formatDateShort', () => {
    it('should format date to short French format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDateShort(date);
      expect(formatted).toBe('15/01/24');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
      expect(capitalize('')).toBe('');
      expect(capitalize('h')).toBe('H');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
      expect(truncate('Hi', 5)).toBe('Hi');
      expect(truncate('Exactly', 7)).toBe('Exactly');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', done => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      // Should not be called immediately
      expect(mockFn).not.toHaveBeenCalled();

      setTimeout(() => {
        // Should be called only once with the last argument
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('arg3');
        done();
      }, 150);
    });
  });

  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('should detect non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });
});
