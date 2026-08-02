const ONE_SIZE_TOKEN = "one";

export function formatMerchSize(size: string, oneSizeLabel: string): string {
  return size === ONE_SIZE_TOKEN ? oneSizeLabel : size;
}

export function formatMerchSizesSummary(
  sizes: string[] | undefined,
  oneSizeLabel: string
): string | null {
  if (!sizes?.length) return null;
  if (sizes.length === 1 && sizes[0] === ONE_SIZE_TOKEN) return oneSizeLabel;
  return sizes.map((s) => formatMerchSize(s, oneSizeLabel)).join(" · ");
}

export function buildMerchOrderBody(
  productName: string,
  size: string | null,
  oneSizeLabel: string,
  sizeFieldLabel: string
): string {
  if (!size) return productName;
  const sizeText = formatMerchSize(size, oneSizeLabel);
  return `${productName}\n${sizeFieldLabel}: ${sizeText}`;
}

export function isOneSizeProduct(sizes: string[] | undefined): boolean {
  return sizes?.length === 1 && sizes[0] === ONE_SIZE_TOKEN;
}

export function productRequiresSizeSelection(sizes: string[] | undefined): boolean {
  if (!sizes?.length) return false;
  return !isOneSizeProduct(sizes);
}
