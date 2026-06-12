export type CommerceProductSource = 'manual' | 'document';

export interface CommerceAssetLike {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  asset_type?: string | null;
  file_size?: string | number | null;
  file_url?: string | null;
  preview_url?: string | null;
  is_premium?: boolean | null;
  price_fcfy?: number | string | null;
  monetization_active?: boolean | null;
}

export interface CommerceProductLike {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description?: string;
  image?: string;
  images?: string[];
  category?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  featured?: boolean;
  variants?: Array<{
    name: string;
    value: string;
    priceModifier?: number;
    inStock?: boolean;
  }>;
  variantLabels?: string[];
  source?: CommerceProductSource;
  assetId?: string;
  downloadUrl?: string;
}

const toNumber = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

export function mapAssetToCommerceProduct(
  asset: CommerceAssetLike,
): CommerceProductLike | null {
  if (!asset?.file_url || !asset.monetization_active) return null;

  const descriptionParts = [
    asset.description,
    asset.asset_type,
    asset.file_size ? String(asset.file_size) : '',
  ]
    .map((part) => String(part || '').trim())
    .filter(Boolean);

  return {
    id: `asset:${asset.id}`,
    name: asset.title || 'Document',
    price: toNumber(asset.price_fcfy),
    description: descriptionParts.join(' • ') || undefined,
    image: asset.preview_url || undefined,
    category: asset.category || 'Documents',
    inStock: true,
    featured: Boolean(asset.is_premium),
    source: 'document',
    assetId: asset.id,
    downloadUrl: asset.file_url || undefined,
  };
}

export function buildDocumentCommerceCatalog(assets: CommerceAssetLike[] = []) {
  return assets.map(mapAssetToCommerceProduct).filter(Boolean) as CommerceProductLike[];
}

export function mergeDocumentCommerceCatalog(
  existingProducts: CommerceProductLike[] = [],
  documentProducts: CommerceProductLike[] = [],
) {
  const manualProducts = existingProducts.filter(
    (product) => product.source !== 'document' && !String(product.id).startsWith('asset:'),
  );

  return [...manualProducts, ...documentProducts];
}

export function normalizePaymentGateway(provider?: string | null) {
  const value = String(provider || 'paydunya').toLowerCase();

  if (value === 'stripe' || value === 'paydunya' || value === 'mock') {
    return value;
  }

  return 'paydunya';
}
