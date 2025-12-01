/**
 * Unit Tests for Accessibility Utilities
 * 
 * Tests contrast ratio calculations and touch target validation.
 */

import {
  getLuminance,
  getContrastRatio,
  meetsContrastRequirements,
  validateTouchTarget,
  getMinTouchTargetSize,
  calculateRequiredHitSlop,
} from '../accessibility';

describe('Accessibility Utilities', () => {
  describe('getLuminance', () => {
    it('should calculate luminance for pure black', () => {
      const luminance = getLuminance('#000000');
      expect(luminance).toBe(0);
    });

    it('should calculate luminance for pure white', () => {
      const luminance = getLuminance('#FFFFFF');
      expect(luminance).toBe(1);
    });

    it('should handle colors without # prefix', () => {
      const withHash = getLuminance('#FF0000');
      const withoutHash = getLuminance('FF0000');
      expect(withHash).toBe(withoutHash);
    });

    it('should calculate luminance for red', () => {
      const luminance = getLuminance('#FF0000');
      expect(luminance).toBeCloseTo(0.2126, 4);
    });

    it('should calculate luminance for green', () => {
      const luminance = getLuminance('#00FF00');
      expect(luminance).toBeCloseTo(0.7152, 4);
    });

    it('should calculate luminance for blue', () => {
      const luminance = getLuminance('#0000FF');
      expect(luminance).toBeCloseTo(0.0722, 4);
    });

    it('should calculate luminance for gray', () => {
      const luminance = getLuminance('#808080');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate maximum contrast for black and white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBe(21);
    });

    it('should calculate minimum contrast for identical colors', () => {
      const ratio = getContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBe(1);
    });

    it('should be symmetric (order should not matter)', () => {
      const ratio1 = getContrastRatio('#000000', '#FFFFFF');
      const ratio2 = getContrastRatio('#FFFFFF', '#000000');
      expect(ratio1).toBe(ratio2);
    });

    it('should calculate contrast for indigo primary on white', () => {
      const ratio = getContrastRatio('#4f46e5', '#FFFFFF');
      expect(ratio).toBeGreaterThan(4.5); // Should meet AA standard
    });

    it('should calculate contrast for cyan accent on dark background', () => {
      const ratio = getContrastRatio('#06b6d4', '#0f172a');
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('should calculate contrast for text on surface', () => {
      const ratio = getContrastRatio('#f1f5f9', '#1e293b');
      expect(ratio).toBeGreaterThan(7); // Should meet AAA standard
    });
  });

  describe('meetsContrastRequirements', () => {
    describe('AA level - normal text', () => {
      it('should pass for black text on white background', () => {
        const meets = meetsContrastRequirements('#000000', '#FFFFFF', 'AA', false);
        expect(meets).toBe(true);
      });

      it('should pass for 4.5:1 ratio', () => {
        // #767676 on white has approximately 4.5:1 ratio
        const meets = meetsContrastRequirements('#767676', '#FFFFFF', 'AA', false);
        expect(meets).toBe(true);
      });

      it('should fail for insufficient contrast', () => {
        const meets = meetsContrastRequirements('#CCCCCC', '#FFFFFF', 'AA', false);
        expect(meets).toBe(false);
      });
    });

    describe('AA level - large text', () => {
      it('should pass for 3:1 ratio with large text', () => {
        // #949494 on white has approximately 3:1 ratio
        const meets = meetsContrastRequirements('#949494', '#FFFFFF', 'AA', true);
        expect(meets).toBe(true);
      });

      it('should have lower requirements than normal text', () => {
        const color = '#949494';
        const background = '#FFFFFF';
        
        const normalText = meetsContrastRequirements(color, background, 'AA', false);
        const largeText = meetsContrastRequirements(color, background, 'AA', true);
        
        expect(normalText).toBe(false);
        expect(largeText).toBe(true);
      });
    });

    describe('AAA level - normal text', () => {
      it('should pass for black text on white background', () => {
        const meets = meetsContrastRequirements('#000000', '#FFFFFF', 'AAA', false);
        expect(meets).toBe(true);
      });

      it('should require 7:1 ratio', () => {
        // #595959 on white has approximately 7:1 ratio
        const meets = meetsContrastRequirements('#595959', '#FFFFFF', 'AAA', false);
        expect(meets).toBe(true);
      });

      it('should fail for AA-passing but AAA-failing contrast', () => {
        // #767676 passes AA but fails AAA
        const meets = meetsContrastRequirements('#767676', '#FFFFFF', 'AAA', false);
        expect(meets).toBe(false);
      });
    });

    describe('AAA level - large text', () => {
      it('should require 4.5:1 ratio for large text', () => {
        const meets = meetsContrastRequirements('#767676', '#FFFFFF', 'AAA', true);
        expect(meets).toBe(true);
      });
    });

    it('should default to AA level when not specified', () => {
      const meetsDefault = meetsContrastRequirements('#767676', '#FFFFFF');
      const meetsAA = meetsContrastRequirements('#767676', '#FFFFFF', 'AA');
      expect(meetsDefault).toBe(meetsAA);
    });
  });

  describe('validateTouchTarget', () => {
    it('should pass for 48x48 touch target', () => {
      const valid = validateTouchTarget(48, 48);
      expect(valid).toBe(true);
    });

    it('should pass for touch targets larger than 48x48', () => {
      const valid = validateTouchTarget(72, 72);
      expect(valid).toBe(true);
    });

    it('should fail for touch targets smaller than 48x48', () => {
      const valid = validateTouchTarget(40, 40);
      expect(valid).toBe(false);
    });

    it('should fail if width is sufficient but height is not', () => {
      const valid = validateTouchTarget(48, 40);
      expect(valid).toBe(false);
    });

    it('should fail if height is sufficient but width is not', () => {
      const valid = validateTouchTarget(40, 48);
      expect(valid).toBe(false);
    });

    it('should allow custom minimum size', () => {
      const valid = validateTouchTarget(40, 40, 40);
      expect(valid).toBe(true);
    });

    it('should handle edge case of exactly minimum size', () => {
      const valid = validateTouchTarget(48, 48, 48);
      expect(valid).toBe(true);
    });

    it('should handle rectangular touch targets', () => {
      const valid = validateTouchTarget(100, 48);
      expect(valid).toBe(true);
    });
  });

  describe('getMinTouchTargetSize', () => {
    it('should return 48 as minimum touch target size', () => {
      const minSize = getMinTouchTargetSize();
      expect(minSize).toBe(48);
    });
  });

  describe('calculateRequiredHitSlop', () => {
    it('should return zero hitSlop for elements meeting minimum size', () => {
      const hitSlop = calculateRequiredHitSlop(48, 48);
      expect(hitSlop).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    });

    it('should return zero hitSlop for elements larger than minimum', () => {
      const hitSlop = calculateRequiredHitSlop(72, 72);
      expect(hitSlop).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    });

    it('should calculate hitSlop for small elements', () => {
      const hitSlop = calculateRequiredHitSlop(40, 40);
      expect(hitSlop).toEqual({ top: 4, right: 4, bottom: 4, left: 4 });
    });

    it('should calculate hitSlop for very small elements', () => {
      const hitSlop = calculateRequiredHitSlop(24, 24);
      expect(hitSlop).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
    });

    it('should calculate asymmetric hitSlop for rectangular elements', () => {
      const hitSlop = calculateRequiredHitSlop(48, 40);
      expect(hitSlop).toEqual({ top: 4, right: 0, bottom: 4, left: 0 });
    });

    it('should calculate hitSlop only for dimension that needs it', () => {
      const hitSlop = calculateRequiredHitSlop(40, 48);
      expect(hitSlop).toEqual({ top: 0, right: 4, bottom: 0, left: 4 });
    });

    it('should allow custom minimum size', () => {
      const hitSlop = calculateRequiredHitSlop(40, 40, 44);
      expect(hitSlop).toEqual({ top: 2, right: 2, bottom: 2, left: 2 });
    });

    it('should handle edge case of exactly minimum size', () => {
      const hitSlop = calculateRequiredHitSlop(48, 48, 48);
      expect(hitSlop).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    });
  });
});
