/**
 * Border Design Tokens
 * 
 * Defines border radius values for the shape language
 * and border width tokens.
 */

export interface BorderRadiusTokens {
  small: number;   // 8px - Small elements
  medium: number;  // 14px - Standard components
  large: number;   // 20px - Large cards
  full: number;    // 9999px - Circular elements
}

export interface BorderWidthTokens {
  thin: number;    // 1px - Standard borders
  medium: number;  // 2px - Emphasized borders
  thick: number;   // 4px - Heavy borders
}

export interface BorderTokens {
  radius: BorderRadiusTokens;
  width: BorderWidthTokens;
}

/**
 * Border Radius Scale
 */
export const radius: BorderRadiusTokens = {
  small: 8,
  medium: 14,
  large: 20,
  full: 9999,
};

/**
 * Border Width Scale
 */
export const width: BorderWidthTokens = {
  thin: 1,
  medium: 2,
  thick: 4,
};

/**
 * Complete Border Token System
 */
export const borders: BorderTokens = {
  radius,
  width,
};
