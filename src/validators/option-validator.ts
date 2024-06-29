// bg-zinc-950 border-zinc-950
// bg-blue-950 border-blue-950
// bg-gray-400 border-gray-400
// bg-rose-950 border-rose-950

import { PRODUCT_PRICES } from "@/config/products";

/* 
These comments are made because tailwindcss does not support
the dynamic color classNames like : `border-${color.tw}` and `bg-${color.tw}`

Putting the used colors as comments anywhere in the code in any file
will enable tailwind to support the dynamic color classNames
*/

export const COLORS = [
  { label: "Black", value: "black", tw: "zinc-950" },
  {
    label: "Blue",
    value: "blue",
    tw: "blue-950",
  },
  { label: "Stone", value: "stone", tw: "gray-400" },
  { label: "Rose", value: "rose", tw: "rose-950" },
] as const;

export const MODELS = {
  name: "models",
  options: [
    {
      label: "iPhone X",
      value: "iphonex",
    },
    {
      label: "iPhone 11",
      value: "iphone11",
    },
    {
      label: "iPhone 12",
      value: "iphone12",
    },
    {
      label: "iPhone 13",
      value: "iphone13",
    },
    {
      label: "iPhone 14",
      value: "iphone14",
    },
    {
      label: "iPhone 15",
      value: "iphone15",
    },
  ],
} as const;

export const MATERIALS = {
  name: "material",
  options: [
    {
      label: "Silicone",
      value: "silicone",
      description: undefined,
      price: PRODUCT_PRICES.material.silicone,
    },
    {
      label: "Soft Polycarbonate",
      value: "polycarbonate",
      description: "Scratch-resistant coating",
      price: PRODUCT_PRICES.material.polycarbonate,
    },
  ],
} as const;

export const FINISHES = {
  name: "finish",
  options: [
    {
      label: "Smooth Finish",
      value: "smooth",
      description: undefined,
      price: PRODUCT_PRICES.finish.smooth,
    },
    {
      label: "Textured Finish",
      value: "textured",
      description: "Soft grippy texture",
      price: PRODUCT_PRICES.finish.textured,
    },
  ],
} as const;
