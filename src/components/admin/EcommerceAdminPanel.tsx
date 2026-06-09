import React, { useState } from 'react';
import { useEcommerceStore, type Product, type Order } from '@/stores/ecommerce.store';
import { MediaPickerButton } from './MediaPickerDialog';
import { toast } from 'sonner';
import { ShoppingCart, Package, Plus, Pencil, Trash2, X, Save, DollarSign, Eye, EyeOff, ListOrdered } from 'lucide-react';

const emptyProduct = (): Product => ({
  id: 'prod_' + Date.now(),
  name: '',
  price: 0,
  originalPrice: undefined,
  description: '',
  image: '',
  category: '',
  rating: undefined,
  reviews: undefined,
  inStock: true,
  featured: false,
});

export function EcommerceAdminPanel() {
  const products = useEcommerceStore((s) => s.products);
  const setProducts = useEcommerceStore((s) => s.setProducts);
  const cart = useEcommerceStore((s) => s.cart);
  const orders = useEcommerceStore((s) => s.orders);
  const currency = useEcommerceStore((s) => s.currency);
  const shippingCost = useEcommerceStore((s) => s.shippingCost);
  const taxRate = useEcommerceStore((s) => s.taxRate);
  const clearCart = useEcommerceStore((s) => s.clearCart);
  const updateOrderStatus = useEcommerceStore((s) => s.updateOrderStatus);

  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'products' | 'orders' | 'settings'>('products');

  const saveProduct = (product: Product) => {
    const exists = products.find((p) => p.id === product.id);
    if (exists) {
      setProducts(products.map((p) => (p.id === product.id ? product : p)));
      toast.success('Produit mis à jour');
    } else {
      setProducts([...products, product]);
      toast.success('Produit ajouté');
    }
    setEditing(null);
    setShowForm(false);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success('Produit supprimé');
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderStatusBadge: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Package size={18} className="text-blue-600" /></div>
            <div><p className="text-2xl font-black text-slate-900">{products.length}</p><p className="text-xs text-slate-500">Produits</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><ShoppingCart size={18} className="text-emerald-600" /></div>
            <div><p className="text-2xl font-black text-slate-900">{cart.length}</p><p className="text-xs text-slate-500">Articles en panier</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><DollarSign size={18} className="text-amber-600" /></div>
            <div><p className="text-2xl font-black text-slate-900">{totalRevenue.toFixed(2)} {currency}</p><p className="text-xs text-slate-500">Revenu total</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><ListOrdered size={18} className="text-indigo-600" /></div>
            <div><p className="text-2xl font-black text-slate-900">{orders.length}</p><p className="text-xs text-slate-500">Commandes</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Package size={18} className="text-purple-600" /></div>
            <div><p className="text-2xl font-black text-slate-900">{products.filter((p) => !p.inStock).length}</p><p className="text-xs text-slate-500">Rupture de stock</p></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(['products', 'orders', 'settings'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'products' ? '📦 Catalogue' : t === 'orders' ? '🛒 Commandes' : '⚙️ Paramètres'}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {tab === 'products' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Gestion des produits</h3>
            <button onClick={() => { setEditing(emptyProduct()); setShowForm(true); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus size={14} /> Ajouter
            </button>
          </div>

          {showForm && editing && (
            <ProductForm product={editing} onSave={saveProduct} onCancel={() => { setShowForm(false); setEditing(null); }} />
          )}

          {products.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">Aucun produit. Cliquez sur "Ajouter" pour créer le premier.</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="p-3 font-semibold">Produit</th>
                <th className="p-3 font-semibold">Prix</th>
                <th className="p-3 font-semibold">Stock</th>
                <th className="p-3 font-semibold">Catégorie</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr></thead>
              <tbody>{products.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-3 flex items-center gap-3">
                    {p.image ? <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 text-lg">📦</div>}
                    <div><p className="font-semibold text-slate-900">{p.name || '(sans nom)'}</p>
                      {p.description && <p className="text-[10px] text-slate-400 line-clamp-1">{p.description}</p>}</div>
                  </td>
                  <td className="p-3 font-mono text-xs">
                    {p.price.toFixed(2)} {currency}
                    {p.originalPrice && p.originalPrice > p.price && <span className="text-slate-400 line-through ml-1">{p.originalPrice.toFixed(2)} {currency}</span>}
                  </td>
                  <td className="p-3">{p.inStock !== false
                    ? <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">En stock</span>
                    : <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Épuisé</span>}</td>
                  <td className="p-3 text-xs text-slate-500">{p.category || '—'}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing({ ...p }); setShowForm(true); }}
                        className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><Pencil size={14} className="text-slate-400" /></button>
                      <button onClick={() => deleteProduct(p.id)}
                        className="p-1.5 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {/* Current Cart */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Panier actuel</h3>
              {cart.length > 0 && (
                <button onClick={() => { clearCart(); toast.success('Panier vidé'); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 size={14} /> Vider
                </button>
              )}
            </div>
            {cart.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Aucun article dans le panier.</div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-3 font-semibold">Produit</th>
                  <th className="p-3 font-semibold">PU</th>
                  <th className="p-3 font-semibold">Qté</th>
                  <th className="p-3 font-semibold text-right">Total</th>
                </tr></thead>
                <tbody>{cart.map((item) => (
                  <tr key={item.productId + (item.variantKey || '')} className="border-b border-slate-50">
                    <td className="p-3 flex items-center gap-3">
                      {item.image ? <img src={item.image} alt="" className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-300">📦</div>}
                      <div><span className="font-medium text-slate-900">{item.name}</span>
                        {item.variantKey && <span className="text-[10px] text-slate-400 block">{item.variantKey}</span>}</div>
                    </td>
                    <td className="p-3 font-mono text-xs">{item.price.toFixed(2)} {currency}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3 font-mono text-xs text-right font-bold">{(item.price * item.quantity).toFixed(2)} {currency}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>

          {/* Order History */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Historique des commandes ({orders.length})</h3>
            </div>
            {orders.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Aucune commande passée.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-bold text-sm text-slate-900 font-mono">{order.id}</span>
                        <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${orderStatusBadge[order.status] || 'bg-slate-100 text-slate-600'}`}>
                          {order.status}
                        </span>
                      </div>
                      <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white">
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {order.customer.name} · {order.customer.email} · {order.customer.city}
                      <span className="ml-2 text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-semibold text-slate-700">{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
                      <span className="font-mono font-bold text-slate-900">{order.total.toFixed(2)} {order.currency}</span>
                      <span className="text-slate-400">dont {order.tax.toFixed(2)} taxes · {order.shipping.toFixed(2)} livraison</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <h3 className="font-bold text-slate-900">Paramètres de la boutique</h3>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Général</h4>
            <SettingsRow label="Devise">
              <input type="text" value={currency}
                onChange={(e) => useEcommerceStore.setState({ currency: e.target.value })}
                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono" />
            </SettingsRow>
            <SettingsRow label="Frais de livraison">
              <input type="number" min={0} step={0.01} value={shippingCost}
                onChange={(e) => useEcommerceStore.setState({ shippingCost: parseFloat(e.target.value) || 0 })}
                className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono" />
            </SettingsRow>
            <SettingsRow label="Taux de TVA">
              <input type="number" min={0} max={1} step={0.01} value={taxRate}
                onChange={(e) => useEcommerceStore.setState({ taxRate: parseFloat(e.target.value) || 0 })}
                className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono" />
            </SettingsRow>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paiement PayDunya</h4>
            <SettingsRow label="Fournisseur de paiement">
              <select value={useEcommerceStore.getState().paymentProvider}
                onChange={(e) => useEcommerceStore.setState({ paymentProvider: e.target.value as any })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm">
                <option value="paydunya">PayDunya (Orange Money, Wave, Carte)</option>
                <option value="mock">Mode mock (pas de vrai paiement)</option>
              </select>
            </SettingsRow>
            <SettingsRow label="Mode sandbox">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useEcommerceStore.getState().paydunyaSandbox}
                  onChange={(e) => useEcommerceStore.setState({ paydunyaSandbox: e.target.checked })}
                  className="rounded" />
                <span className="text-sm text-slate-600">Environnement de test</span>
              </label>
            </SettingsRow>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <strong>⚠️ Clés API PayDunya</strong>
              <p className="mt-1 text-amber-600">Les clés PayDunya se configurent via le fichier <code className="bg-amber-100 px-1 rounded">.env</code> du serveur :</p>
              <pre className="mt-1 text-[10px] font-mono bg-amber-100/50 p-2 rounded">PAYDUNYA_MASTER_KEY=votre_master_key
PAYDUNYA_PRIVATE_KEY=votre_private_key
PAYDUNYA_TOKEN=votre_token
PAYDUNYA_SANDBOX=true
ENABLE_PAYMENTS=true</pre>
            </div>
          </div>

          <div className="text-xs text-slate-400 italic">Les modifications sont automatiquement sauvegardées.</div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }: { product: Product; onSave: (p: Product) => void; onCancel: () => void }) {
  const [p, setP] = useState<Product>(product);
  const update = (partial: Partial<Product>) => setP((prev) => ({ ...prev, ...partial }));

  const addVariantGroup = () => {
    const label = window.prompt('Nom de la variante (ex: Taille, Couleur) :');
    if (!label) return;
    const variants = p.variants || [];
    const variantLabels = p.variantLabels || [];
    update({ variants: [...variants, { name: label, value: '' }], variantLabels: [...variantLabels, label] });
  };

  const updateVariant = (idx: number, field: string, val: any) => {
    const variants = [...(p.variants || [])];
    variants[idx] = { ...variants[idx], [field]: val };
    update({ variants });
  };

  const removeVariant = (idx: number) => {
    const variants = [...(p.variants || [])];
    variants.splice(idx, 1);
    update({ variants });
  };

  return (
    <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nom</label>
          <input value={p.name} onChange={(e) => update({ name: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm" /></div>
        <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Catégorie</label>
          <input value={p.category || ''} onChange={(e) => update({ category: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm" /></div>
        <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Prix</label>
          <input type="number" min={0} step={0.01} value={p.price} onChange={(e) => update({ price: parseFloat(e.target.value) || 0 })}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono" /></div>
        <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Prix original (promo)</label>
          <input type="number" min={0} step={0.01} value={p.originalPrice || ''} onChange={(e) => update({ originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono" /></div>
      </div>
      <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Image</label>
        <div className="flex gap-2 items-center">
          <input value={p.image || ''} onChange={(e) => update({ image: e.target.value })}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm" placeholder="URL de l'image" />
          <MediaPickerButton onSelect={(url) => update({ image: url })} label="Médiathèque" />
        </div>
      </div>
      <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description</label>
        <textarea value={p.description || ''} onChange={(e) => update({ description: e.target.value })} rows={2}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm resize-none" /></div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={p.inStock !== false} onChange={(e) => update({ inStock: e.target.checked })} />
          En stock
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={p.featured || false} onChange={(e) => update({ featured: e.target.checked })} />
          Mis en avant
        </label>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          {p.rating ? <span>Note: {p.rating} ★</span> : null}
          {p.reviews !== undefined ? <span>({p.reviews} avis)</span> : null}
        </div>
      </div>

      {/* Variants */}
      <div className="border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Variantes</span>
          <button onClick={addVariantGroup}
            className="text-[10px] px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors">
            + Variante
          </button>
        </div>
        {(p.variants || []).length === 0 && <p className="text-[10px] text-slate-400 italic">Aucune variante (taille, couleur, etc.)</p>}
        {(p.variants || []).map((v, i) => (
          <div key={i} className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-medium text-slate-500 w-16 shrink-0">{v.name}</span>
            <input value={v.value} onChange={(e) => updateVariant(i, 'value', e.target.value)}
              placeholder="Valeur (ex: XL, Rouge)" className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
            <input type="number" value={v.priceModifier || 0} onChange={(e) => updateVariant(i, 'priceModifier', parseFloat(e.target.value) || 0)}
              placeholder="+€" className="w-20 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono" title="Supplément de prix" />
            <label className="flex items-center gap-1 text-[9px] text-slate-400 shrink-0">
              <input type="checkbox" checked={v.inStock !== false} onChange={(e) => updateVariant(i, 'inStock', e.target.checked)} /> Stock
            </label>
            <button onClick={() => removeVariant(i)}
              className="p-1 text-red-400 hover:text-red-600 transition-colors"><X size={12} /></button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={() => onSave(p)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
          <Save size={14} /> Enregistrer
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-300 transition-colors">
          <X size={14} /> Annuler
        </button>
      </div>
    </div>
  );
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </div>
  );
}
