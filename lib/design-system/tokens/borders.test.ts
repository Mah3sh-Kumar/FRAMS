/**
 * Border Token Tests
 * 
 * Unit tests for border token structure and accessibility
 */

import { borders, radius } from './borders';

describe('Border Tokens', () => {
  describe('Convenience Accessors', () => {
    it('should provide medium border radius via convenience accessor', () => {
      expect(borders.medium).toBe(14);
    });

    it('should provide full border radius via convenience accessor', () => {
      expect(borders.full).toBe(9999);
    });

    it('should provide small border radius via convenience accessor', () => {
      expect(borders.small).toBe(8);
    });

    it('should provide large border radius via convenience accessor', () => {
      expect(borders.large).toBe(20);
    });
  });

  describe('Nested Structure Backward Compatibility', () => {
    it('should maintain nested access for medium radius', () => {
      expect(borders.radius.medium).toBe(14);
    });

    it('should maintain nested access for full radius', () => {
      expect(borders.radius.full).toBe(9999);
    });

    it('should maintain nested access for small radius', () => {
      expect(borders.radius.small).toBe(8);
    });

    it('should maintain nested access for large radius', () => {
      expect(borders.radius.large).toBe(20);
    });
  });

  describe('Consistency Between Access Patterns', () => {
    it('should return same value for flat and nested medium access', () => {
      expect(borders.medium).toBe(borders.radius.medium);
    });

    it('should return same value for flat and nested full access', () => {
      expect(borders.full).toBe(borders.radius.full);
    });

    it('should return same value for flat and nested small access', () => {
      expect(borders.small).toBe(borders.radius.small);
    });

    it('should return same value for flat and nested large access', () => {
      expect(borders.large).toBe(borders.radius.large);
    });
  });

  describe('Border Width Tokens', () => {
    it('should provide border width tokens', () => {
      expect(borders.width.thin).toBe(1);
      expect(borders.width.medium).toBe(2);
      expect(borders.width.thick).toBe(4);
    });
  });
});
