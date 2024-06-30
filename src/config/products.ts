// Use 1_00_000 instead of 100000 for large numbers
// Interpretes same but good pracice for a dev

export const PRODUCT_PRICES = {
  material: {
    silicone: 0, // Free (default)
    polycarbonate: 300, // premium
  },
  finish: {
    smooth: 0, // Free (default)
    textured: 150, // premium
  },
} as const;

export const BASE_PRICE = 400;
