export type CartLineItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string | null;
  quantity: number;
};

export function cartLineKey(item: Pick<CartLineItem, "productId" | "size">): string {
  return `${item.productId}::${item.size ?? ""}`;
}
