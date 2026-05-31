import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch } from '@/lib/api-client';

export interface ProductVariant {
  name: string;
  value: string;
  priceModifier?: number;
  inStock?: boolean;
}

export interface Product {
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
  variants?: ProductVariant[];
  variantLabels?: string[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantKey?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  currency: string;
  customer: { name: string; email: string; address: string; city: string; phone: string };
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentToken?: string;
  paymentProvider?: string;
  createdAt: string;
}

type PaymentProvider = 'paydunya' | 'stripe' | 'mock';

interface EcommerceState {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  currency: string;
  shippingCost: number;
  taxRate: number;
  paymentProvider: PaymentProvider;
  paydunyaMasterKey: string;
  paydunyaPrivateKey: string;
  paydunyaToken: string;
  paydunyaSandbox: boolean;
  checkoutLoading: boolean;
  checkoutUrl: string | null;
  checkoutError: string | null;

  setProducts: (products: Product[]) => void;
  addToCart: (product: Product, quantity?: number, variantKey?: string) => void;
  removeFromCart: (productId: string, variantKey?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantKey?: string) => void;
  clearCart: () => void;
  checkout: (customer: Order['customer']) => Promise<string | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updatePaymentSettings: (settings: Partial<Pick<EcommerceState, 'paymentProvider' | 'paydunyaMasterKey' | 'paydunyaPrivateKey' | 'paydunyaToken' | 'paydunyaSandbox' | 'currency' | 'shippingCost' | 'taxRate'>>) => void;
  resetCheckoutState: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
}

function cartItemKey(productId: string, variantKey?: string) {
  return variantKey ? `${productId}::${variantKey}` : productId;
}

export const useEcommerceStore = create<EcommerceState>()(
  persist(
    (set, get) => ({
      products: [],
      cart: [],
      orders: [],
      currency: 'XOF',
      shippingCost: 0,
      taxRate: 0,
      paymentProvider: 'paydunya',
      paydunyaMasterKey: '',
      paydunyaPrivateKey: '',
      paydunyaToken: '',
      paydunyaSandbox: true,
      checkoutLoading: false,
      checkoutUrl: null,
      checkoutError: null,

      setProducts: (products) => set({ products }),

      addToCart: (product, quantity = 1, variantKey) => set((state) => {
        const key = cartItemKey(product.id, variantKey);
        const existing = state.cart.find((item) => cartItemKey(item.productId, item.variantKey) === key);
        const finalPrice = variantKey ? product.variants?.find((v) => v.value === variantKey)?.priceModifier
          ? product.price + (product.variants.find((v) => v.value === variantKey)?.priceModifier || 0)
          : product.price : product.price;
        if (existing) {
          return { cart: state.cart.map((item) =>
            cartItemKey(item.productId, item.variantKey) === key ? { ...item, quantity: item.quantity + quantity } : item
          )};
        }
        return { cart: [...state.cart, {
          productId: product.id, name: product.name, price: finalPrice,
          quantity, image: product.image, variantKey
        }]};
      }),

      removeFromCart: (productId, variantKey) => set((state) => {
        const key = cartItemKey(productId, variantKey);
        return { cart: state.cart.filter((item) => cartItemKey(item.productId, item.variantKey) !== key) };
      }),

      updateQuantity: (productId, quantity, variantKey) => set((state) => {
        const key = cartItemKey(productId, variantKey);
        return { cart: quantity <= 0
          ? state.cart.filter((item) => cartItemKey(item.productId, item.variantKey) !== key)
          : state.cart.map((item) => cartItemKey(item.productId, item.variantKey) === key ? { ...item, quantity } : item)
        };
      }),

      clearCart: () => set({ cart: [] }),

      checkout: async (customer) => {
        const state = get();
        const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = subtotal * state.taxRate;
        const total = subtotal + state.shippingCost + tax;

        set({ checkoutLoading: true, checkoutError: null, checkoutUrl: null });

        // Create local order first
        const orderRef = 'ORD-' + Date.now().toString(36).toUpperCase();
        const order: Order = {
          id: orderRef,
          items: [...state.cart],
          total,
          subtotal,
          shipping: state.shippingCost,
          tax,
          currency: state.currency,
          customer,
          status: 'pending',
          paymentStatus: 'pending',
          paymentProvider: state.paymentProvider,
          createdAt: new Date().toISOString(),
        };

        // Try server payment if provider is paydunya or stripe
        if (state.paymentProvider === 'paydunya' || state.paymentProvider === 'stripe') {
          try {
            const endpoint = state.paymentProvider === 'paydunya'
              ? '/api/payments/paydunya/checkout'
              : '/api/payments/checkout';

            const session = await apiFetch<any>(endpoint, {
              method: 'POST',
              body: JSON.stringify({
                amount: Math.round(total * 100), // cents / FCFA
                currency: state.currency,
                description: `Commande ${orderRef}`,
                metadata: { order_ref: orderRef },
                customer: {
                  name: customer.name,
                  email: customer.email,
                  phone: customer.phone,
                },
                storeName: 'PROQUELEC Shop',
                channels: ['orange-money', 'wave'],
              }),
            });

            order.paymentToken = session.token || session.id;

            if (session.url) {
              set({
                orders: [order, ...state.orders],
                cart: [],
                checkoutLoading: false,
                checkoutUrl: session.url,
              });
              return session.url;
            }
          } catch (err: any) {
            console.warn('[CHECKOUT] Server payment failed, falling back to local:', err.message);
            set({ checkoutError: err.message });
          }
        }

        // Fallback: local-only checkout (mock / offline)
        set((s) => ({
          orders: [order, ...s.orders],
          cart: [],
          checkoutLoading: false,
          checkoutUrl: null,
        }));
        return null;
      },

      updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map((o) => o.id === orderId ? { ...o, status } : o),
      })),

      updatePaymentSettings: (settings) => set((state) => ({
        ...state,
        ...settings,
      })),

      resetCheckoutState: () => set({ checkoutLoading: false, checkoutUrl: null, checkoutError: null }),

      getCartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
      getCartTotal: () => {
        const state = get();
        const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return subtotal + state.shippingCost + subtotal * state.taxRate;
      },
      getCartSubtotal: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'proquelec-ecommerce',
      partialize: (state) => ({
        cart: state.cart, products: state.products, orders: state.orders,
        currency: state.currency, shippingCost: state.shippingCost, taxRate: state.taxRate,
        paymentProvider: state.paymentProvider,
        paydunyaMasterKey: state.paydunyaMasterKey, paydunyaPrivateKey: state.paydunyaPrivateKey,
        paydunyaToken: state.paydunyaToken, paydunyaSandbox: state.paydunyaSandbox,
      }),
    }
  )
);
