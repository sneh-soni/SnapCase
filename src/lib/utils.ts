import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number) => {
  // Inbuilt formatter : Intl
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });
  return formatter.format(price);
};

export function constructMetadata({
  title = "Snapcase - Get your custom phone case",
  description = "Create high-quality, custom image phone cases in seconds",
  icons = "/favicon.ico",
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
} = {}): Metadata {
  return {
    title,
    description,
    icons,
    metadataBase: new URL("https://snap-case.vercel.app/"),
  };
}
