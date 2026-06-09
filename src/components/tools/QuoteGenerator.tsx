/**
 * GÉNÉRATEUR DE DEVIS PROFESSIONNEL — PROQUELEC
 *
 * Crée des devis d'installation électrique avec catalogue produits,
 * options de personnalisation, aperçu et export Word.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  FileSpreadsheet,
  QrCode,
  Image,
  Signature,
  Scale,
  Percent,
  Hash,
  ShoppingCart,
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════

interface QuoteItem {
  id: string;
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

interface ClientInfo {
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
}

interface QuoteOptions {
  logo: boolean;
  signature: boolean;
  mentionsLegales: boolean;
  tva: boolean;
  acompte: boolean;
  qrCode: boolean;
}

interface QuoteResult {
  totalHT: number;
  tva: number;
  totalTTC: number;
  acompte: number;
  acomptePercent: number;
  nombreItems: number;
}

interface QuoteData {
  id: string;
  quoteNumber: string;
  date: string;
  client: ClientInfo;
  items: QuoteItem[];
  options: QuoteOptions;
  tvaRate: number;
  acomptePercent: number;
  result: QuoteResult;
}

// ════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════

const PRODUCT_CATALOG = [
  { designation: 'Disjoncteur 10A', prixUnitaire: 4500 },
  { designation: 'Disjoncteur 16A', prixUnitaire: 4800 },
  { designation: 'Disjoncteur 20A', prixUnitaire: 5200 },
  { designation: 'Disjoncteur 32A', prixUnitaire: 6500 },
  { designation: 'DDR 30mA 40A', prixUnitaire: 25000 },
  { designation: 'DDR 30mA 63A', prixUnitaire: 32000 },
  { designation: 'Câble R2V 1.5mm²', prixUnitaire: 350 },
  { designation: 'Câble R2V 2.5mm²', prixUnitaire: 550 },
  { designation: 'Câble R2V 6mm²', prixUnitaire: 1200 },
  { designation: 'Prise 2P+T', prixUnitaire: 2500 },
  { designation: 'Interrupteur', prixUnitaire: 2000 },
  { designation: 'Tableau électrique 13 modules', prixUnitaire: 18000 },
  { designation: 'Tableau électrique 18 modules', prixUnitaire: 25000 },
  { designation: 'Parafoudre', prixUnitaire: 45000 },
  { designation: 'Contacteur HC/HP', prixUnitaire: 15000 },
  { designation: 'Gaine ICTA 16mm', prixUnitaire: 2800 },
  { designation: 'Piquet de terre 1.5m', prixUnitaire: 8500 },
];

const HISTORY_KEY = 'proquelec_quote_history';

const TVA_RATES = [
  { value: 18, label: '18%' },
  { value: 0, label: '0%' },
];

const ACOMPTE_RATES = [
  { value: 30, label: '30%' },
  { value: 50, label: '50%' },
  { value: 0, label: '0%' },
];

// ════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════

export default function QuoteGenerator() {
  // Client info
  const [client, setClient] = useState<ClientInfo>({
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
  });

  // Quote items
  const [items, setItems] = useState<QuoteItem[]>([]);

  // Product catalog selection
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // Quote options
  const [options, setOptions] = useState<QuoteOptions>({
    logo: false,
    signature: false,
    mentionsLegales: false,
    tva: false,
    acompte: false,
    qrCode: false,
  });

  const [tvaRate, setTvaRate] = useState<number>(18);
  const [acomptePercent, setAcomptePercent] = useState<number>(30);

  // Result
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [generatedQuote, setGeneratedQuote] = useState<QuoteData | null>(null);
  const [history, setHistory] = useState<QuoteData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignorer
    }
  }, []);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Ignorer
    }
  }, [history]);

  // Add item from catalog
  const addFromCatalog = useCallback(() => {
    if (!selectedProduct) return;
    const product = PRODUCT_CATALOG.find((p) => p.designation === selectedProduct);
    if (!product) return;

    const existingIndex = items.findIndex((item) => item.designation === product.designation);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantite: updated[existingIndex].quantite + 1,
      };
      setItems(updated);
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID?.() || Date.now().toString(),
          designation: product.designation,
          quantite: 1,
          prixUnitaire: product.prixUnitaire,
        },
      ]);
    }
    setSelectedProduct('');
  }, [selectedProduct, items]);

  // Add empty row
  const addEmptyRow = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID?.() || Date.now().toString(),
        designation: '',
        quantite: 1,
        prixUnitaire: 0,
      },
    ]);
  }, []);

  // Remove item
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Update item field
  const updateItem = useCallback((id: string, field: keyof QuoteItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                typeof value === 'string' && field !== 'designation'
                  ? parseFloat(value) || 0
                  : value,
            }
          : item,
      ),
    );
  }, []);

  // Set client field
  const updateClient = useCallback((field: keyof ClientInfo, value: string) => {
    setClient((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Toggle option
  const toggleOption = useCallback((opt: keyof QuoteOptions) => {
    setOptions((prev) => ({ ...prev, [opt]: !prev[opt] }));
  }, []);

  // Calculate totals
  const calculateResult = useCallback((): QuoteResult => {
    const totalHT = items.reduce((sum, item) => sum + item.prixUnitaire * item.quantite, 0);
    const tva = options.tva ? Math.round((totalHT * tvaRate) / 100) : 0;
    const totalTTC = totalHT + tva;
    const acompte = options.acompte ? Math.round((totalTTC * acomptePercent) / 100) : 0;

    return {
      totalHT,
      tva,
      totalTTC,
      acompte,
      acomptePercent: options.acompte ? acomptePercent : 0,
      nombreItems: items.length,
    };
  }, [items, options, tvaRate, acomptePercent]);

  // Generate quote
  const generateQuote = useCallback(() => {
    if (items.length === 0) return;
    setIsGenerating(true);

    setTimeout(() => {
      const quoteResult = calculateResult();
      const quoteNumber = 'DQ' + Math.floor(1000 + Math.random() * 9000);
      const date = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      const quoteData: QuoteData = {
        id: crypto.randomUUID?.() || Date.now().toString(),
        quoteNumber,
        date,
        client: { ...client },
        items: [...items],
        options: { ...options },
        tvaRate: options.tva ? tvaRate : 0,
        acomptePercent: options.acompte ? acomptePercent : 0,
        result: quoteResult,
      };

      setResult(quoteResult);
      setGeneratedQuote(quoteData);

      // Add to history
      setHistory((prev) => {
        const updated = [quoteData, ...prev];
        return updated.slice(0, 20);
      });

      setIsGenerating(false);
    }, 800);
  }, [client, items, options, tvaRate, acomptePercent, calculateResult]);

  // Download quote as Word (.doc)
  const downloadQuote = useCallback(() => {
    if (!generatedQuote) return;

    const d = generatedQuote;
    const escapeHtml = (str: string | number | null | undefined): string => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const logoHtml = options.logo
      ? '<img src="https://proquelec.sn/logo.png" alt="PROQUELEC" style="height:48px;max-width:180px;margin-bottom:8px;" onerror="this.style.display=\'none\'">'
      : '';

    const itemsHtml = d.items.length
      ? `<table style="width:100%;border-collapse:collapse;margin-bottom:1rem;font-size:13px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="border:1px solid #d1d5db;padding:6px 4px;">N°</th>
              <th style="border:1px solid #d1d5db;padding:6px 4px;">Désignation</th>
              <th style="border:1px solid #d1d5db;padding:6px 4px;text-align:right;">Qté</th>
              <th style="border:1px solid #d1d5db;padding:6px 4px;text-align:right;">Prix unitaire (FCFA)</th>
              <th style="border:1px solid #d1d5db;padding:6px 4px;text-align:right;">Sous-total (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            ${d.items
              .map(
                (item, i) => `
              <tr>
                <td style="border:1px solid #d1d5db;padding:6px 4px;text-align:center;">${i + 1}</td>
                <td style="border:1px solid #d1d5db;padding:6px 4px;">${escapeHtml(item.designation)}</td>
                <td style="border:1px solid #d1d5db;padding:6px 4px;text-align:right;">${item.quantite}</td>
                <td style="border:1px solid #d1d5db;padding:6px 4px;text-align:right;">${item.prixUnitaire.toLocaleString('fr-FR')}</td>
                <td style="border:1px solid #d1d5db;padding:6px 4px;text-align:right;">${(item.prixUnitaire * item.quantite).toLocaleString('fr-FR')}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>`
      : '<div style="color:#64748b;">Aucun élément</div>';

    const mentionsHtml = options.mentionsLegales
      ? '<div style="font-size:12px;color:#64748b;margin-top:1.5rem;">Devis valable 30 jours. Paiement à réception. Conforme à la réglementation sénégalaise NS 01 001. Conditions générales disponibles sur demande.</div>'
      : '';

    const acompteHtml =
      options.acompte && d.result.acompte > 0
        ? `<div style="margin-top:1rem;font-size:13px;"><b>Acompte à verser (${d.acomptePercent}%) :</b> <span style="color:#2563eb;">${d.result.acompte.toLocaleString('fr-FR')} FCFA</span></div>`
        : '';

    const qrHtml = options.qrCode
      ? `<div style="margin-top:1.5rem;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://proquelec.sn" alt="QR code PROQUELEC" style="height:80px;"></div>`
      : '';

    const signatureHtml = options.signature
      ? '<div style="margin-top:2.5rem;display:flex;justify-content:space-between;"><div><b>Signature client</b><br><br><br>_________________________</div><div><b>Signature PROQUELEC</b><br><br><br>_________________________</div></div>'
      : '';

    const tvaTaux = options.tva ? d.tvaRate : 0;

    const tvaLabel = options.tva ? `TVA ${tvaTaux}% :` : 'TVA :';

    const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <title>Devis ${escapeHtml(d.quoteNumber)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #222; max-width: 700px; margin: auto; padding: 2rem; }
    h2 { color: #2563eb; font-size: 1.5rem; margin-bottom: 0.25rem; }
    h3 { color: #222; font-size: 1.1rem; margin-bottom: 0.3rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
    th, td { border: 1px solid #d1d5db; padding: 6px 4px; text-align: left; }
    th { background: #f3f4f6; }
    .totaux { font-weight: 600; }
    .totaux-final { font-weight: 700; color: #2563eb; }
    .section { margin-bottom: 1.2rem; }
    .flex-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
    .text-right { text-align: right; }
    .text-blue { color: #2563eb; }
  </style>
</head>
<body>
  <div class="flex-row">
    <div>
      ${logoHtml}
      <h2>DEVIS N° ${escapeHtml(d.quoteNumber)}</h2>
      <p style="color:#64748b;">Date : ${escapeHtml(d.date)}</p>
    </div>
    <div class="text-right">
      <p style="font-weight:600;">PROQUELEC</p>
      <p style="font-size:0.95rem;color:#64748b;">Expert en installations électriques</p>
      <p style="font-size:0.85rem;color:#64748b;">Dakar, Sénégal</p>
    </div>
  </div>
  <div class="section">
    <h3>Client</h3>
    <div class="text-blue" style="font-weight:500;">${escapeHtml(d.client.nom || 'Non renseigné')}</div>
    ${d.client.telephone ? `<div style="color:#64748b;font-size:13px;">Tél : ${escapeHtml(d.client.telephone)}</div>` : ''}
    ${d.client.email ? `<div style="color:#64748b;font-size:13px;">Email : ${escapeHtml(d.client.email)}</div>` : ''}
    ${d.client.adresse ? `<div style="color:#64748b;font-size:13px;">Adresse chantier : ${escapeHtml(d.client.adresse)}</div>` : ''}
  </div>
  <div class="section">
    <h3>Éléments inclus</h3>
    ${itemsHtml}
  </div>
  <div class="section" style="border-top:2px solid #e2e8f0;padding-top:1.2rem;margin-top:1.2rem;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span class="totaux">Total HT :</span>
      <span class="totaux">${d.result.totalHT.toLocaleString('fr-FR')} FCFA</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span class="totaux">${tvaLabel}</span>
      <span class="totaux">${tvaTaux > 0 ? d.result.tva.toLocaleString('fr-FR') : '0'} FCFA</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span class="totaux-final">Total TTC :</span>
      <span class="totaux-final">${d.result.totalTTC.toLocaleString('fr-FR')} FCFA</span>
    </div>
    ${acompteHtml}
  </div>
  ${mentionsHtml}
  ${signatureHtml}
  ${qrHtml}
</body>
</html>`;

    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Devis_${d.quoteNumber}.doc`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [generatedQuote, options]);

  // New quote
  const newQuote = useCallback(() => {
    setClient({ nom: '', telephone: '', email: '', adresse: '' });
    setItems([]);
    setSelectedProduct('');
    setOptions({
      logo: false,
      signature: false,
      mentionsLegales: false,
      tva: false,
      acompte: false,
      qrCode: false,
    });
    setTvaRate(18);
    setAcomptePercent(30);
    setResult(null);
    setGeneratedQuote(null);
  }, []);

  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('fr-FR') + ' FCFA';
  };

  // Format date
  const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Load quote from history
  const loadFromHistory = useCallback((quote: QuoteData) => {
    setClient(quote.client);
    setItems(quote.items);
    setOptions(quote.options);
    setTvaRate(quote.tvaRate);
    setAcomptePercent(quote.acomptePercent);
    setResult(quote.result);
    setGeneratedQuote(quote);
  }, []);

  // Delete history entry
  const deleteHistoryEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  // Compute live totals for preview
  const liveTotalHT = items.reduce((sum, item) => sum + item.prixUnitaire * item.quantite, 0);
  const liveTVA = options.tva ? Math.round((liveTotalHT * tvaRate) / 100) : 0;
  const liveTotalTTC = liveTotalHT + liveTVA;
  const liveAcompte = options.acompte ? Math.round((liveTotalTTC * acomptePercent) / 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-lg bg-emerald-600/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-emerald-400">Générateur de Devis Professionnel</h2>
          <p className="text-sm text-slate-400">
            Créez des devis conformes pour installations électriques
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN — FORM */}
        <div className="space-y-6">
          {/* CLIENT INFORMATION */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
                <User className="w-5 h-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-nom" className="text-slate-300 font-medium">
                  <User className="w-3.5 h-3.5 inline mr-1.5" />
                  Nom du client
                </Label>
                <Input
                  id="client-nom"
                  value={client.nom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateClient('nom', e.target.value)
                  }
                  placeholder="Nom complet ou raison sociale"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-tel" className="text-slate-300 font-medium">
                    <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                    Téléphone
                  </Label>
                  <Input
                    id="client-tel"
                    value={client.telephone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateClient('telephone', e.target.value)
                    }
                    placeholder="77 123 45 67"
                    className="bg-emerald-900/20 border-emerald-800/40 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-email" className="text-slate-300 font-medium">
                    <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                    Email
                  </Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={client.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateClient('email', e.target.value)
                    }
                    placeholder="client@exemple.sn"
                    className="bg-emerald-900/20 border-emerald-800/40 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-adresse" className="text-slate-300 font-medium">
                  <MapPin className="w-3.5 h-3.5 inline mr-1.5" />
                  Adresse du chantier
                </Label>
                <Textarea
                  id="client-adresse"
                  value={client.adresse}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    updateClient('adresse', e.target.value)
                  }
                  placeholder="Adresse complète du lieu d'installation"
                  rows={2}
                  className="bg-emerald-900/20 border-emerald-800/40 text-white resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* PRODUCT CATALOG */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
                <ShoppingCart className="w-5 h-5" />
                Catalogue Produits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="bg-emerald-900/20 border-emerald-800/40 text-white">
                      <SelectValue placeholder="Choisir un produit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATALOG.map((product) => (
                        <SelectItem key={product.designation} value={product.designation}>
                          {product.designation} — {product.prixUnitaire.toLocaleString('fr-FR')}{' '}
                          FCFA
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={addFromCatalog}
                  disabled={!selectedProduct}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>

              {/* ITEMS TABLE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-slate-300 font-medium">Articles du devis</Label>
                  <span className="text-xs text-slate-400">{items.length} article(s)</span>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-emerald-800/30 rounded-lg">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Aucun article ajouté
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-emerald-800/30">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-emerald-900/20 hover:bg-emerald-900/30">
                          <TableHead className="text-emerald-300 w-8">#</TableHead>
                          <TableHead className="text-emerald-300">Désignation</TableHead>
                          <TableHead className="text-emerald-300 text-right w-20">Qté</TableHead>
                          <TableHead className="text-emerald-300 text-right w-32">
                            Prix unitaire (FCFA)
                          </TableHead>
                          <TableHead className="text-emerald-300 text-right w-28">
                            Sous-total
                          </TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow
                            key={item.id}
                            className="hover:bg-emerald-900/10 border-emerald-800/20"
                          >
                            <TableCell className="text-slate-400 text-xs">{index + 1}</TableCell>
                            <TableCell className="p-1">
                              <Input
                                value={item.designation}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  updateItem(item.id, 'designation', e.target.value)
                                }
                                className="h-8 bg-emerald-900/20 border-emerald-800/40 text-white text-sm min-w-[140px]"
                                placeholder="Désignation"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <Input
                                type="number"
                                value={item.quantite}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  updateItem(item.id, 'quantite', e.target.value)
                                }
                                min="0"
                                className="h-8 w-16 bg-emerald-900/20 border-emerald-800/40 text-white text-sm text-center"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <Input
                                type="number"
                                value={item.prixUnitaire}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  updateItem(item.id, 'prixUnitaire', e.target.value)
                                }
                                min="0"
                                className="h-8 w-28 bg-emerald-900/20 border-emerald-800/40 text-white text-sm text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right text-sm text-slate-200 font-mono">
                              {(item.prixUnitaire * item.quantite).toLocaleString('fr-FR')}
                            </TableCell>
                            <TableCell className="p-1">
                              <Button
                                onClick={() => removeItem(item.id)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <Button
                  onClick={addEmptyRow}
                  variant="outline"
                  size="sm"
                  className="w-full border-emerald-800/40 text-slate-300 hover:text-white hover:bg-emerald-900/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter une ligne
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* QUOTE OPTIONS */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
                <FileSpreadsheet className="w-5 h-5" />
                Options du devis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-emerald-900/10 border border-emerald-800/30 cursor-pointer hover:bg-emerald-900/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.logo}
                    onChange={() => toggleOption('logo')}
                    className="accent-emerald-500"
                  />
                  <Image className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-200">Logo PROQUELEC</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-emerald-900/10 border border-emerald-800/30 cursor-pointer hover:bg-emerald-900/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.signature}
                    onChange={() => toggleOption('signature')}
                    className="accent-emerald-500"
                  />
                  <Signature className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-200">Zone signature</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-emerald-900/10 border border-emerald-800/30 cursor-pointer hover:bg-emerald-900/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.mentionsLegales}
                    onChange={() => toggleOption('mentionsLegales')}
                    className="accent-emerald-500"
                  />
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-200">Mentions légales</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-emerald-900/10 border border-emerald-800/30 cursor-pointer hover:bg-emerald-900/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.tva}
                    onChange={() => toggleOption('tva')}
                    className="accent-emerald-500"
                  />
                  <Percent className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-200">TVA</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-emerald-900/10 border border-emerald-800/30 cursor-pointer hover:bg-emerald-900/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.acompte}
                    onChange={() => toggleOption('acompte')}
                    className="accent-emerald-500"
                  />
                  <Hash className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-200">Acompte</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-emerald-900/10 border border-emerald-800/30 cursor-pointer hover:bg-emerald-900/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.qrCode}
                    onChange={() => toggleOption('qrCode')}
                    className="accent-emerald-500"
                  />
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-200">QR code</span>
                </label>
              </div>

              {/* Conditional rate selectors */}
              <div className="grid grid-cols-2 gap-4">
                {options.tva && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Taux de TVA</Label>
                    <Select
                      value={String(tvaRate)}
                      onValueChange={(v: string) => setTvaRate(Number(v))}
                    >
                      <SelectTrigger className="bg-emerald-900/20 border-emerald-800/40 text-white h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TVA_RATES.map((rate) => (
                          <SelectItem key={rate.value} value={String(rate.value)}>
                            {rate.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {options.acompte && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Acompte</Label>
                    <Select
                      value={String(acomptePercent)}
                      onValueChange={(v: string) => setAcomptePercent(Number(v))}
                    >
                      <SelectTrigger className="bg-emerald-900/20 border-emerald-800/40 text-white h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACOMPTE_RATES.map((rate) => (
                          <SelectItem key={rate.value} value={String(rate.value)}>
                            {rate.value > 0 ? `${rate.value}%` : "Pas d'acompte"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN — RESULTS & ACTIONS */}
        <div className="space-y-6">
          {/* ACTIONS */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
                <FileText className="w-5 h-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={generateQuote}
                disabled={items.length === 0 || isGenerating}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-11"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Générer le Devis
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                {generatedQuote && (
                  <Button
                    onClick={downloadQuote}
                    className="bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger (.doc)
                  </Button>
                )}
                <Button
                  onClick={newQuote}
                  variant="outline"
                  className="border-emerald-800/40 text-slate-300 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Nouveau devis
                </Button>
              </div>

              {/* QUOTE OPTIONS SUMMARY — Live results */}
              {items.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-emerald-900/10 border border-emerald-800/30 space-y-2">
                  <h4 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-3">
                    Résumé du devis
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Nombre d'articles</span>
                    <span className="text-slate-200 font-medium">{items.length}</span>
                  </div>
                  <Separator className="bg-emerald-800/30" />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total HT</span>
                    <span className="text-slate-200 font-medium">
                      {formatCurrency(liveTotalHT)}
                    </span>
                  </div>
                  {options.tva && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">TVA ({tvaRate}%)</span>
                      <span className="text-slate-200 font-medium">{formatCurrency(liveTVA)}</span>
                    </div>
                  )}
                  <Separator className="bg-emerald-800/30" />
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-emerald-300">Total TTC</span>
                    <span className="text-emerald-400">{formatCurrency(liveTotalTTC)}</span>
                  </div>
                  {options.acompte && liveAcompte > 0 && (
                    <div className="flex justify-between text-sm pt-1">
                      <span className="text-slate-400">Acompte ({acomptePercent}%)</span>
                      <span className="text-amber-400 font-medium">
                        {formatCurrency(liveAcompte)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* QUOTE PREVIEW (only after generation) */}
          {generatedQuote && result && (
            <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
                  <FileText className="w-5 h-5" />
                  Aperçu du Devis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-6 text-slate-800 text-sm space-y-4 shadow-sm">
                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-blue-600 pb-4">
                    <div>
                      {options.logo && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                            PQ
                          </div>
                          <span className="text-xs text-emerald-700 font-semibold">PROQUELEC</span>
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-blue-600">
                        DEVIS N° {generatedQuote.quoteNumber}
                      </h3>
                      <p className="text-xs text-slate-500">Date : {generatedQuote.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">PROQUELEC</p>
                      <p className="text-xs text-slate-500">Expert en installations électriques</p>
                      <p className="text-xs text-slate-400">Dakar, Sénégal</p>
                    </div>
                  </div>

                  {/* Client info */}
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">Client</h4>
                    <p className="text-blue-600 font-medium">
                      {generatedQuote.client.nom || 'Non renseigné'}
                    </p>
                    {generatedQuote.client.telephone && (
                      <p className="text-xs text-slate-500">
                        Tél : {generatedQuote.client.telephone}
                      </p>
                    )}
                    {generatedQuote.client.email && (
                      <p className="text-xs text-slate-500">
                        Email : {generatedQuote.client.email}
                      </p>
                    )}
                    {generatedQuote.client.adresse && (
                      <p className="text-xs text-slate-500">
                        Adresse chantier : {generatedQuote.client.adresse}
                      </p>
                    )}
                  </div>

                  {/* Items table */}
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Éléments inclus</h4>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-200 p-1.5 text-left">N°</th>
                          <th className="border border-slate-200 p-1.5 text-left">Désignation</th>
                          <th className="border border-slate-200 p-1.5 text-right">Qté</th>
                          <th className="border border-slate-200 p-1.5 text-right">
                            Prix unitaire
                          </th>
                          <th className="border border-slate-200 p-1.5 text-right">Sous-total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedQuote.items.map((item, i) => (
                          <tr key={item.id}>
                            <td className="border border-slate-200 p-1.5 text-center">{i + 1}</td>
                            <td className="border border-slate-200 p-1.5">{item.designation}</td>
                            <td className="border border-slate-200 p-1.5 text-right">
                              {item.quantite}
                            </td>
                            <td className="border border-slate-200 p-1.5 text-right">
                              {item.prixUnitaire.toLocaleString('fr-FR')}
                            </td>
                            <td className="border border-slate-200 p-1.5 text-right font-medium">
                              {(item.prixUnitaire * item.quantite).toLocaleString('fr-FR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="border-t-2 border-slate-200 pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total HT :</span>
                      <span className="font-medium">
                        {result.totalHT.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    {options.tva && (
                      <div className="flex justify-between text-sm">
                        <span>TVA {tvaRate}% :</span>
                        <span className="font-medium">
                          {result.tva.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-blue-600 pt-1">
                      <span>Total TTC :</span>
                      <span>{result.totalTTC.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    {options.acompte && result.acompte > 0 && (
                      <div className="flex justify-between text-sm pt-1">
                        <span>Acompte à verser ({acomptePercent}%) :</span>
                        <span className="text-amber-600 font-medium">
                          {result.acompte.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Options extras */}
                  {options.mentionsLegales && (
                    <div className="text-xs text-slate-400 border-t border-slate-200 pt-3">
                      Devis valable 30 jours. Paiement à réception. Conforme à la réglementation
                      sénégalaise NS 01 001.
                    </div>
                  )}

                  <div className="flex justify-between items-end pt-2">
                    {options.signature && (
                      <div className="flex gap-6 text-xs text-slate-500">
                        <div>
                          <p className="font-medium text-slate-600 mb-4">Signature client</p>
                          <div className="border-b border-slate-300 w-28"></div>
                        </div>
                        <div>
                          <p className="font-medium text-slate-600 mb-4">Signature PROQUELEC</p>
                          <div className="border-b border-slate-300 w-28"></div>
                        </div>
                      </div>
                    )}
                    {options.qrCode && (
                      <div className="text-right">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://proquelec.sn"
                          alt="QR Code PROQUELEC"
                          className="inline-block"
                          style={{ width: 60, height: 60 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* HISTORY */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
                <FileSpreadsheet className="w-5 h-5" />
                Historique des devis
              </CardTitle>
              {history.length > 0 && (
                <Button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem(HISTORY_KEY);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Effacer
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-6">Aucun devis sauvegardé</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg bg-emerald-900/10 border border-emerald-800/30 hover:bg-emerald-900/20 transition-colors cursor-pointer"
                      onClick={() => loadFromHistory(entry)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-medium text-slate-200">
                            {entry.quoteNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{formatDate(entry.id)}</span>
                          <Button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              deleteHistoryEntry(entry.id);
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-400 truncate max-w-[180px]">
                          {entry.client.nom || 'Client non renseigné'} · {entry.items.length}{' '}
                          article(s)
                        </span>
                        <span className="text-xs font-medium text-emerald-400">
                          {entry.result.totalTTC.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
