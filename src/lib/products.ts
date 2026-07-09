import messenger from "@/assets/product-messenger.jpg";
import tote from "@/assets/product-tote.jpg";
import briefcase from "@/assets/product-briefcase.jpg";

export type Product = {
  id: string;
  image_url: string;
  category: string;
  price: number;
  in_stock: boolean;
  quantity: number;
  size: string | null;
  color_en: string | null;
  color_de: string | null;
  title_en: string;
  title_de: string;
  description_en: string;
  description_de: string;
  material_en: string | null;
  material_de: string | null;
  notes_en: string | null;
  notes_de: string | null;
  sort_order: number;
};

const seedMap: Record<string, string> = {
  "/src/assets/product-messenger.jpg": messenger,
  "/src/assets/product-tote.jpg": tote,
  "/src/assets/product-briefcase.jpg": briefcase,
};

export function resolveImage(url: string): string {
  return seedMap[url] ?? url;
}