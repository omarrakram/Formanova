import catalog from "../data/products.json";

export type ProductImage = {
  file: string;
  listingPosition: number;
  width: number;
  height: number;
  kind: "styled-interior" | "product-photo";
  source: string;
  sha256: string;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  shortTitle: string;
  url: string;
  collection: { en: string; ar: string };
  /** The variant every campaign advertises (its price is campaign data). */
  variant: string;
  priceNote: string | null;
  claims: { text: string; evidence: string }[];
  images: ProductImage[];
};

const products = catalog.products as Product[];

export const getProduct = (id: string): Product => {
  const product = products.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Unknown product id "${id}" in src/data/products.json`);
  }
  return product;
};

/** Returns the image of a product by its position in the Shopify listing. */
export const getImage = (id: string, listingPosition: number): ProductImage => {
  const image = getProduct(id).images.find(
    (i) => i.listingPosition === listingPosition,
  );
  if (!image) {
    throw new Error(
      `Product "${id}" has no vendored image at listing position ${listingPosition}`,
    );
  }
  return image;
};
