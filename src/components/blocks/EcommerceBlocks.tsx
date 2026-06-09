import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { getUniversalStyles } from './ProquelecBlocks';
import { useEcommerceStore, type Product } from '../../stores/ecommerce.store';
import { AutoSettingsPanel } from './AutoSettingsPanel';

// ── 1. ProductGridBlock ──
export const ProductGridBlock = (props: any) => {
  const { columns = 3, gap = 16, showPrice = true, showRating = true, showAddToCart = true, maxItems = 6 } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const products = useEcommerceStore((s) => s.products);
  const addToCart = useEcommerceStore((s) => s.addToCart);
  const currency = useEcommerceStore((s) => s.currency);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const displayProducts = products.slice(0, maxItems);
  const handleAdd = (product: Product) => {
    addToCart(product);
    setAdded((prev) => new Set(prev).add(product.id));
    setTimeout(() => setAdded((prev) => { const next = new Set(prev); next.delete(product.id); return next; }), 2000);
  };
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(' + Math.min(columns, 4) + ', 1fr)', gap, ...u.style }}
      className={'proquelec-builder-node ' + u.className}>
      {displayProducts.length === 0 && <div style={{ gridColumn: '1 / -1' }} className="text-xs text-slate-400 text-center py-8 italic">Aucun produit. Ajoutez des produits via le bloc Catalogue.</div>}
      {displayProducts.map((product) => (
        <div key={product.id} className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden hover:shadow-md transition-shadow group">
          <div className="aspect-[4/3] bg-[#f1f5f9] relative overflow-hidden">
            {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              : <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">📦</div>}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">-' + Math.round((1 - product.price / product.originalPrice) * 100) + '%</span>)}
            {!product.inStock && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="bg-slate-700 text-white text-[10px] font-bold px-3 py-1 rounded">Épuisé</span></div>}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-slate-800 truncate">{product.name}</h3>
            {product.description && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{product.description}</p>}
            {showPrice && <div className="flex items-center gap-1.5 mt-2">
              <span className="text-sm font-bold text-slate-900">{product.price.toFixed(2)} {currency}</span>
              {product.originalPrice && product.originalPrice > product.price && <span className="text-[10px] text-slate-400 line-through">{product.originalPrice.toFixed(2)} {currency}</span>}
            </div>}
            {showRating && product.rating && <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400 text-[10px]">{String.fromCharCode(9733).repeat(Math.round(product.rating))}{String.fromCharCode(9734).repeat(5 - Math.round(product.rating))}</span>
              {product.reviews !== undefined && <span className="text-[9px] text-slate-400">({product.reviews})</span>}
            </div>}
            {showAddToCart && product.inStock !== false && (
              <button onClick={() => handleAdd(product)} className="mt-2 w-full text-[10px] font-bold py-1.5 rounded-lg transition-all bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95">
                {added.has(product.id) ? '✓ Ajouté' : 'Ajouter au panier'}
              </button>)}
          </div>
        </div>
      ))}
    </div>
  );
};
const ProductGridSettings = () => {
  const { actions: { setProp }, columns, maxItems } = useNode((n: any) => ({ ...n.data.props }));
  return (<div className="space-y-3">
    <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Colonnes</label>
      <input type="range" min={1} max={4} value={columns} onChange={(e: any) => setProp((p: any) => p.columns = parseInt(e.target.value))} className="w-full" />
      <div className="text-[10px] text-slate-500 text-right">{columns}</div></div>
    <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Max produits</label>
      <input type="number" min={1} max={50} value={maxItems} onChange={(e: any) => setProp((p: any) => p.maxItems = parseInt(e.target.value))} className="w-full bg-[#0d0d1a] border border-[#252538] rounded px-2.5 py-1.5 text-xs text-slate-200" /></div>
  </div>);
};
ProductGridBlock.craft = { displayName: 'Grille Produits', props: { columns: 3, gap: 16, showPrice: true, showRating: true, showAddToCart: true, maxItems: 6 }, related: { settings: ProductGridSettings } };

// ── 2. CartBlock ──
export const CartBlock = (props: any) => {
  const { layout = 'full', bgColor = '#ffffff', accentColor = '#2563eb' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const cart = useEcommerceStore((s) => s.cart);
  const currency = useEcommerceStore((s) => s.currency);
  const updateQuantity = useEcommerceStore((s) => s.updateQuantity);
  const removeFromCart = useEcommerceStore((s) => s.removeFromCart);
  const clearCart = useEcommerceStore((s) => s.clearCart);
  const subtotal = useEcommerceStore((s) => s.getCartSubtotal());
  if (layout === 'mini') {
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    return (<div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: bgColor, borderRadius: 8, border: '1px solid #e2e8f0', ...u.style }} className={'proquelec-builder-node ' + u.className}>
      <span className="text-base">🛒</span><span className="text-xs font-bold text-slate-700">{count}</span><span className="text-[10px] text-slate-400">{subtotal.toFixed(2)} {currency}</span></div>);
  }
  return (<div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ background: bgColor, borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', ...u.style }} className={'proquelec-builder-node ' + u.className}>
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0]">
      <h3 className="text-sm font-bold text-slate-800">Panier ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
      {cart.length > 0 && <button onClick={clearCart} className="text-[10px] text-rose-500 hover:text-rose-600 font-medium">Vider</button>}
    </div>
    {cart.length === 0 ? <div className="text-center py-8 text-slate-400 text-xs italic">Votre panier est vide.</div> : (
      <div className="divide-y divide-[#e2e8f0]">{cart.map((item) => (
        <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
          {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">{item.name}</div>
            <div className="text-[10px] text-slate-400">{(item.price * item.quantity).toFixed(2)} {currency}</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded bg-[#f1f5f9] text-slate-600 hover:bg-slate-200 text-xs font-bold">−</button>
            <span className="w-6 text-center text-xs font-semibold text-slate-700">{item.quantity}</span>
            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded bg-[#f1f5f9] text-slate-600 hover:bg-slate-200 text-xs font-bold">+</button>
          </div>
          <button onClick={() => removeFromCart(item.productId)} className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors p-1">✕</button>
        </div>
      ))}</div>
    )}
    {cart.length > 0 && <div className="px-4 py-3 border-t border-[#e2e8f0] bg-[#f8fafc]"><div className="flex justify-between items-center">
      <span className="text-xs font-semibold text-slate-600">Sous-total</span>
      <span className="text-sm font-bold text-slate-900">{subtotal.toFixed(2)} {currency}</span>
    </div></div>}
  </div>);
};
CartBlock.craft = { displayName: 'Panier', props: { layout: 'full', bgColor: '#ffffff', accentColor: '#2563eb' }, related: { settings: AutoSettingsPanel } };

// ── 3. ProductBlock (single) ──
export const ProductBlock = (props: any) => {
  const { productId = '', layout = 'horizontal' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const products = useEcommerceStore((s) => s.products);
  const addToCart = useEcommerceStore((s) => s.addToCart);
  const currency = useEcommerceStore((s) => s.currency);
  const product = products.find((p) => p.id === productId);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  if (!product) return (<div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ padding: 24, textAlign: 'center', border: '1px dashed #e2e8f0', borderRadius: 8, ...u.style }} className={'proquelec-builder-node ' + u.className}><p className="text-xs text-slate-400 italic">Sélectionnez un produit dans les paramètres.</p></div>);
  const isH = layout === 'horizontal';
  const variantModifier = selectedVariant ? product.variants?.find((v) => v.value === selectedVariant)?.priceModifier || 0 : 0;
  const finalPrice = product.price + variantModifier;
  const inStock = selectedVariant ? (product.variants?.find((v) => v.value === selectedVariant)?.inStock ?? product.inStock) : product.inStock;
  const uniqueVariantGroups = product.variantLabels || [...new Set((product.variants || []).map((v) => v.name))];
  return (<div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ display: 'flex', flexDirection: isH ? 'row' : 'column', gap: isH ? 24 : 16, background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', ...u.style }} className={'proquelec-builder-node ' + u.className}>
    <div className={isH ? 'w-1/3 shrink-0' : 'w-full'}><div className="aspect-[4/3] bg-[#f1f5f9]">{product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">📦</div>}</div></div>
    <div className={'p-4 ' + (isH ? 'flex-1' : '')}>
      <h2 className="text-lg font-bold text-slate-900">{product.name}</h2>
      {product.description && <p className="text-sm text-slate-500 mt-1">{product.description}</p>}
      {product.rating && <div className="flex items-center gap-1 mt-2"><span className="text-yellow-400 text-xs">{String.fromCharCode(9733).repeat(Math.round(product.rating))}{String.fromCharCode(9734).repeat(5 - Math.round(product.rating))}</span>{product.reviews !== undefined && <span className="text-[10px] text-slate-400">({product.reviews} avis)</span>}</div>}
      <div className="flex items-center gap-2 mt-3"><span className="text-xl font-bold text-slate-900">{finalPrice.toFixed(2)} {currency}</span>{product.originalPrice && product.originalPrice > product.price && <span className="text-sm text-slate-400 line-through">{product.originalPrice.toFixed(2)} {currency}</span>}</div>
      {/* Variant selector */}
      {uniqueVariantGroups.length > 0 && (product.variants || []).length > 0 && (
        <div className="mt-3 space-y-1.5">
          {uniqueVariantGroups.map((group) => (
            <div key={group}>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{group}</span>
              <div className="flex flex-wrap gap-1.5">
                {(product.variants || []).filter((v) => v.name === group).map((v) => (
                  <button key={v.value} onClick={() => setSelectedVariant(v.value)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-all ${selectedVariant === v.value ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'}`}>
                    {v.value}{v.priceModifier ? ` +${v.priceModifier}${currency}` : ''}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {inStock !== false && <button onClick={() => { addToCart(product, 1, selectedVariant || undefined); setAdded(true); setTimeout(() => setAdded(false), 2000); }} className="mt-4 px-6 py-2 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 active:scale-95 transition-all">{added ? '✓ Ajouté' : 'Ajouter au panier'}</button>}
      {inStock === false && <span className="inline-block mt-3 text-xs font-bold text-rose-500">Épuisé</span>}
    </div>
  </div>);
};
ProductBlock.craft = { displayName: 'Produit', props: { productId: '', layout: 'horizontal' }, related: { settings: AutoSettingsPanel } };

// ── 4. ProductAdminBlock ──
export const ProductAdminBlock = (props: any) => {
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const products = useEcommerceStore((s) => s.products);
  const setProducts = useEcommerceStore((s) => s.setProducts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', originalPrice: '', image: '', description: '', category: '', rating: '', reviews: '', inStock: true, featured: false });
  const handleAdd = () => {
    if (!form.name.trim() || !form.price) return;
    const product: Product = { id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), name: form.name.trim(), price: parseFloat(form.price), originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined, image: form.image || undefined, description: form.description || undefined, category: form.category || undefined, rating: form.rating ? parseFloat(form.rating) : undefined, reviews: form.reviews ? parseInt(form.reviews) : undefined, inStock: form.inStock, featured: form.featured };
    setProducts([...products, product]);
    setForm({ name: '', price: '', originalPrice: '', image: '', description: '', category: '', rating: '', reviews: '', inStock: true, featured: false }); setShowForm(false);
  };
  const handleRemove = (id: string) => setProducts(products.filter((p) => p.id !== id));
  return (<div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', ...u.style }} className={'proquelec-builder-node ' + u.className}>
    <div className="flex items-center justify-between mb-3"><h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Catalogue ({products.length})</h4><button onClick={() => setShowForm(!showForm)} className="text-[10px] px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors">{showForm ? 'Annuler' : '+ Produit'}</button></div>
    {showForm && <div className="space-y-2 mb-3 p-3 bg-white rounded border border-[#e2e8f0]">
      <input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="Nom" className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-xs" />
      <div className="flex gap-2"><input value={form.price} onChange={(e: any) => setForm({ ...form, price: e.target.value })} placeholder="Prix" type="number" step="0.01" className="flex-1 border border-[#e2e8f0] rounded px-2 py-1.5 text-xs" /><input value={form.originalPrice} onChange={(e: any) => setForm({ ...form, originalPrice: e.target.value })} placeholder="Prix original" type="number" step="0.01" className="flex-1 border border-[#e2e8f0] rounded px-2 py-1.5 text-xs" /></div>
      <input value={form.image} onChange={(e: any) => setForm({ ...form, image: e.target.value })} placeholder="URL image" className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-xs" />
      <textarea value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-xs" />
      <div className="flex gap-2"><input value={form.category} onChange={(e: any) => setForm({ ...form, category: e.target.value })} placeholder="Catégorie" className="flex-1 border border-[#e2e8f0] rounded px-2 py-1.5 text-xs" /><input value={form.rating} onChange={(e: any) => setForm({ ...form, rating: e.target.value })} placeholder="Note" type="number" min="0" max="5" step="0.1" className="flex-1 border border-[#e2e8f0] rounded px-2 py-1.5 text-xs" /><input value={form.reviews} onChange={(e: any) => setForm({ ...form, reviews: e.target.value })} placeholder="Avis" type="number" className="flex-1 border border-[#e2e8f0] rounded px-2 py-1.5 text-xs" /></div>
      <div className="flex gap-4"><label className="text-[10px] text-slate-600 flex items-center gap-1"><input type="checkbox" checked={form.inStock} onChange={(e: any) => setForm({ ...form, inStock: e.target.checked })} /> En stock</label><label className="text-[10px] text-slate-600 flex items-center gap-1"><input type="checkbox" checked={form.featured} onChange={(e: any) => setForm({ ...form, featured: e.target.checked })} /> Vedette</label></div>
      <button onClick={handleAdd} disabled={!form.name.trim() || !form.price} className="w-full text-[10px] px-3 py-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:opacity-50 transition-colors">Ajouter</button>
    </div>}
    {products.length === 0 && !showForm && <p className="text-[10px] text-slate-400 text-center py-4">Aucun produit.</p>}
    <div className="space-y-1.5 max-h-48 overflow-y-auto">{products.map((p) => (
      <div key={p.id} className="flex items-center gap-2 p-2 bg-white rounded border border-[#e2e8f0] group">
        {p.image ? <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 rounded bg-[#f1f5f9] flex items-center justify-center text-slate-300 text-xs">📦</div>}
        <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-slate-700 truncate">{p.name}</div><div className="text-[10px] text-slate-400">{p.price.toFixed(2)} €{!p.inStock ? ' — Épuisé' : ''}</div></div>
        <button onClick={() => handleRemove(p.id)} className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">✕</button>
      </div>
    ))}</div>
  </div>);
};
ProductAdminBlock.craft = { displayName: 'Catalogue Produits', props: {}, related: { settings: AutoSettingsPanel } };

// ── 5. PriceBlock ──
export const PriceBlock = (props: any) => {
  const { productId = '', prefix = '', suffix = ' €', showOriginal = true, fontSize = 24, color = '#0f172a' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const products = useEcommerceStore((s) => s.products);
  const product = products.find((p) => p.id === productId);
  return (<div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ display: 'flex', alignItems: 'baseline', gap: 8, ...u.style }} className={'proquelec-builder-node ' + u.className}>
    <span style={{ fontSize, fontWeight: 700, color }}>{prefix}{product ? product.price.toFixed(2) : '0.00'}{suffix}</span>
    {showOriginal && product?.originalPrice && product.originalPrice > product.price && <span style={{ fontSize: fontSize * 0.6, color: '#94a3b8', textDecoration: 'line-through' }}>{prefix}{product.originalPrice.toFixed(2)}{suffix}</span>}
  </div>);
};
PriceBlock.craft = { displayName: 'Prix', props: { productId: '', prefix: '', suffix: ' €', showOriginal: true, fontSize: 24, color: '#0f172a' }, related: { settings: AutoSettingsPanel } };

// ── 6. AddToCartButton ──
export const AddToCartButtonBlock = (props: any) => {
  const { productId = '', text = 'Ajouter au panier', addedText = '✓ Ajouté', bgColor = '#2563eb', textColor = '#ffffff', fullWidth = false } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const products = useEcommerceStore((s) => s.products);
  const addToCart = useEcommerceStore((s) => s.addToCart);
  const product = products.find((p) => p.id === productId);
  const [added, setAdded] = useState(false);
  const handleClick = () => { if (!product) return; addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 2000); };
  return (<button ref={(r: any) => { if (r) connect(drag(r)); }} onClick={handleClick}
    style={{ background: bgColor, color: textColor, border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', width: fullWidth ? '100%' : 'auto', transition: 'all 0.2s', ...u.style }}
    className={'proquelec-builder-node hover:opacity-90 active:scale-95 ' + u.className} disabled={!product}>
    {added ? addedText : text}</button>);
};
AddToCartButtonBlock.craft = { displayName: 'Bouton Achat', props: { productId: '', text: 'Ajouter au panier', addedText: '✓ Ajouté', bgColor: '#2563eb', textColor: '#ffffff', fullWidth: false }, related: { settings: AutoSettingsPanel } };

// ── 7. CheckoutBlock ──
export const CheckoutBlock = (props: any) => {
  const { bgColor = '#ffffff', accentColor = '#2563eb', successMessage = 'Commande confirmée !' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const cart = useEcommerceStore((s) => s.cart);
  const checkout = useEcommerceStore((s) => s.checkout);
  const subtotal = useEcommerceStore((s) => s.getCartSubtotal());
  const currency = useEcommerceStore((s) => s.currency);
  const paymentProvider = useEcommerceStore((s) => s.paymentProvider);
  const checkoutLoading = useEcommerceStore((s) => s.checkoutLoading);
  const checkoutUrl = useEcommerceStore((s) => s.checkoutUrl);
  const checkoutError = useEcommerceStore((s) => s.checkoutError);
  const resetCheckoutState = useEcommerceStore((s) => s.resetCheckoutState);
  const [submitted, setSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'orange-money' | 'wave' | 'card'>('orange-money');
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', phone: '' });

  // Redirect to PayDunya when URL is received
  useEffect(() => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
      setSubmitted(true);
      resetCheckoutState();
    }
  }, [checkoutUrl, resetCheckoutState]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    const url = await checkout(form);
    if (url) {
      // Will redirect via useEffect above
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) return (<div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ padding: 32, textAlign: 'center', background: bgColor, borderRadius: 12, border: '1px solid #e2e8f0', ...u.style }} className={'proquelec-builder-node ' + u.className}>
    <div className="text-4xl mb-3">✅</div><h3 className="text-lg font-bold text-slate-800">{successMessage}</h3>
    {checkoutUrl && <p className="text-xs text-slate-500 mt-2">Redirection vers PayDunya pour le paiement...</p>}
  </div>);
  if (cart.length === 0) return (<div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ padding: 32, textAlign: 'center', background: bgColor, borderRadius: 12, border: '1px solid #e2e8f0', ...u.style }} className={'proquelec-builder-node ' + u.className}>
    <div className="text-4xl mb-3">🛒</div><h3 className="text-sm font-bold text-slate-600">Votre panier est vide</h3>
  </div>);
  return (<div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ background: bgColor, borderRadius: 12, border: '1px solid #e2e8f0', ...u.style }} className={'proquelec-builder-node ' + u.className}>
    <div className="p-4 border-b border-[#e2e8f0]"><h3 className="text-sm font-bold text-slate-800">Finaliser la commande</h3></div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2"><input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="Nom complet" className="flex-1 border border-[#e2e8f0] rounded px-3 py-2 text-xs" /><input value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="flex-1 border border-[#e2e8f0] rounded px-3 py-2 text-xs" /></div>
      <input value={form.address} onChange={(e: any) => setForm({ ...form, address: e.target.value })} placeholder="Adresse" className="w-full border border-[#e2e8f0] rounded px-3 py-2 text-xs" />
      <div className="flex gap-2"><input value={form.city} onChange={(e: any) => setForm({ ...form, city: e.target.value })} placeholder="Ville" className="flex-1 border border-[#e2e8f0] rounded px-3 py-2 text-xs" /><input value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone" className="flex-1 border border-[#e2e8f0] rounded px-3 py-2 text-xs" /></div>

      {/* Payment method selection */}
      {paymentProvider === 'paydunya' && (
        <div className="pt-2 border-t border-[#e2e8f0]">
          <p className="text-xs font-semibold text-slate-600 mb-2">Moyen de paiement</p>
          <div className="space-y-1.5">
            {([{ id: 'orange-money', label: 'Orange Money', icon: '📱' },
               { id: 'wave', label: 'Wave', icon: '🌊' },
               { id: 'card', label: 'Carte bancaire', icon: '💳' },
            ] as const).map((m) => (
              <label key={m.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all text-xs ${paymentMethod === m.id ? 'border-indigo-500 bg-indigo-50' : 'border-[#e2e8f0] hover:border-indigo-300'}`}>
                <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="sr-only" />
                <span className="text-sm">{m.icon}</span>
                <span className="font-medium text-slate-700">{m.label}</span>
                {paymentMethod === m.id && <span className="ml-auto text-indigo-500">✓</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-[#e2e8f0]">
        <span className="text-xs font-semibold text-slate-600">Total</span>
        <span className="text-lg font-bold text-slate-900">{subtotal.toFixed(2)} {currency}</span>
      </div>

      {checkoutError && <p className="text-[10px] text-rose-500 text-center">{checkoutError}</p>}

      <button onClick={handleSubmit} disabled={!form.name || !form.email || checkoutLoading}
        className="w-full py-2.5 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
        {checkoutLoading ? <><span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Paiement en cours...</> : `Payer ${subtotal.toFixed(2)} ${currency}`}
      </button>

      {paymentProvider === 'paydunya' && (
        <p className="text-[9px] text-slate-400 text-center">Paiement sécurisé via PayDunya — Orange Money, Wave ou carte</p>
      )}
    </div>
  </div>);
};
CheckoutBlock.craft = { displayName: 'Checkout', props: { bgColor: '#ffffff', accentColor: '#2563eb', successMessage: 'Commande confirmée !' }, related: { settings: AutoSettingsPanel } };
