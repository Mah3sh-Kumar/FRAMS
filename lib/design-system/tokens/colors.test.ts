/**
 * Color Token Tests
 * 
 * Unit tests for color token structure
 */

import { colors } from './colors';

describe('Color Tokens', () => {
  describe('Background Color Token', () => {
    it('should provide background color token', () => {
      expect(colors.background).toBeDefined();
    });

    it('should provide background.main with valid color string', () => {
      expect(colors.background.main).toBeDefined();
      expect(typeof colors.background.main).toBe('string');
      expect(colors.background.main).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should provide all ColorToken properties for background', () => {
      expect(colors.background.main).toBeDefined();
      expect(colors.background.light).toBeDefined();
      expect(colors.background.dark).toBeDefined();
      expect(colors.background.gradient).toBeDefined();
      expect(colors.background.contrast).toBeDefined();
    });

    it('should have gradient as tuple with two elements', () => {
      expect(Array.isArray(colors.background.gradient)).toBe(true);
      expect(colors.background.gradient.length).toBe(2);
    });

    it('should have valid color strings for all properties', () => {
      const colorRegex = /^#[0-9a-f]{6}$/i;
      expect(colors.background.main).toMatch(colorRegex);
      expect(colors.background.light).toMatch(colorRegex);
      expect(colors.background.dark).toMatch(colorRegex);
      expect(colors.background.contrast).toMatch(colorRegex);
      expect(colors.background.gradient[0]).toMatch(colorRegex);
      expect(colors.background.gradient[1]).toMatch(colorRegex);
    });
  });
});
