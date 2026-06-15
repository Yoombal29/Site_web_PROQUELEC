import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Block, BlockStyle, BlockContent } from '@/types/builder';
import { secureSetItem, secureGetItem, secureRemoveItem } from '@/lib/crypto-utils';
import cloneDeep from 'lodash.clonedeep';
import { eventBus } from '@/engine/events/bus';

export interface BlockTemplate {
  id: string;
  name: string;
  block: Block;
  thumbnail?: string;
  createdAt: number;
}

const DEFAULT_BUILDER_TEMPLATES: BlockTemplate[] = [
  {
    id: uuidv4(),
    name: 'Hero Épuré',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'hero',
      content: {
        title: 'Sécurisez vos espaces commerciaux avec élégance',
        subtitle: 'Solutions de protection électrique, design moderne et performance garantie.',
        text: 'Découvrir nos services',
        href: '/contact',
      },
      style: {
        padding: '120px 20px',
        backgroundImage: 'linear-gradient(135deg, #020617 0%, #102a52 100%)',
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Poppins',
        boxShadow: '0 30px 90px rgba(0,0,0,0.18)',
      },
    },
  },
  {
    id: uuidv4(),
    name: 'Bannière Statistiques',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Résultats mesurables',
        subtitle: 'Objectif zéro sinistre, 500+ audits et accompagnement 24/7.',
      },
      style: {
        padding: '60px 30px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
        fontFamily: 'Inter',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-3"><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">95%</h3><p class="text-sm text-slate-500 mt-2">Taux de satisfaction client</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">500+</h3><p class="text-sm text-slate-500 mt-2">Installations auditées</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">24/7</h3><p class="text-sm text-slate-500 mt-2">Assistance technique</p></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Module Avantages',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Pourquoi nous choisir ?',
        subtitle: 'Des solutions sur-mesure, un suivi pro et un design épuré pour chaque projet.',
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        maxWidth: '1100px',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontFamily: 'Inter',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-3 text-left"><div class="rounded-[28px] p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Analyse complète</h3><p class="text-sm text-slate-500">Étude terrain, audit technique et recommandations claires.</p></div><div class="rounded-[28px] p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Installation sûre</h3><p class="text-sm text-slate-500">Mise en œuvre certifiée, protection durable et respect des normes.</p></div><div class="rounded-[28px] p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Support premium</h3><p class="text-sm text-slate-500">Accompagnement 24/7 pour votre tranquillité d’esprit.</p></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Appel à l’action',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        html: '<div class="rounded-[32px] bg-blue-950 text-white p-10 md:p-12"><div class="max-w-3xl mx-auto text-center"><h2 class="text-3xl md:text-4xl font-extrabold mb-4">Prêt à sécuriser votre espace ?</h2><p class="text-sm md:text-base text-slate-200 mb-6">Passez à l’action avec une équipe experte, des solutions personnalisées et une réalisation impeccable.</p><a href="/contact" class="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-3 text-sm font-semibold shadow-lg hover:bg-orange-400 transition">Demander un devis</a></div></div>',
      },
      style: {
        padding: '0',
        backgroundColor: 'transparent',
        fontFamily: 'Inter',
      },
    },
  },
  {
    id: uuidv4(),
    name: 'Témoignages Clients',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Ils nous font confiance',
        subtitle: 'Des retours concrets et vérifiés de clients professionnels.',
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        fontFamily: 'Inter',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-3"><div class="rounded-3xl p-6 bg-white shadow-sm"><p class="text-slate-500">"Une équipe très réactive et un travail soigné."</p><span class="mt-4 block font-semibold">- Marie</span></div><div class="rounded-3xl p-6 bg-white shadow-sm"><p class="text-slate-500">"Nous avons réduit les incidents électriques de 100%."</p><span class="mt-4 block font-semibold">- Oumar</span></div><div class="rounded-3xl p-6 bg-white shadow-sm"><p class="text-slate-500">"Conseils clairs, mise en œuvre rapide."</p><span class="mt-4 block font-semibold">- Fatou</span></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Grille de Services',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Nos services clés',
        subtitle: 'Une offre modulaire pour chaque besoin électrique.',
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Inter',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-3 text-left"><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Audit électrique</h3><p class="text-sm text-slate-500">Contrôle complet et rapport d’optimisation.</p></div><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Mise en conformité</h3><p class="text-sm text-slate-500">Installation aux normes NS 01-001.</p></div><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Maintenance</h3><p class="text-sm text-slate-500">Suivi préventif et dépannage rapide.</p></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'FAQ Rapide',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Questions fréquentes',
        subtitle: 'Réponses claires pour rassurer vos clients.',
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        fontFamily: 'Inter',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="space-y-4 text-left max-w-3xl mx-auto"><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="font-semibold">Comment réserver un audit ?</h3><p class="text-slate-500">Contactez-nous via le formulaire ou par téléphone.</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="font-semibold">Quels services sont couverts ?</h3><p class="text-slate-500">Audit, conformité, formation et maintenance.</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="font-semibold">Intervenez-vous sur site rapidement ?</h3><p class="text-slate-500">Oui, nos équipes sont disponibles sous 48h.</p></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Contact Rapide',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Besoin d’un devis rapide ?',
        subtitle: 'Nous sommes prêts à vous répondre en moins de 24h.',
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#111827',
        color: '#f8fafc',
        textAlign: 'center',
        fontFamily: 'Inter',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="max-w-3xl mx-auto p-8 rounded-3xl bg-slate-900/90 shadow-xl"><p class="text-slate-200 mb-4">Contactez-nous par téléphone, email ou formulaire. Nous adaptons notre solution à vos marchés, commerces et sites industriels.</p><div class="grid gap-4 md:grid-cols-3"><div class="rounded-2xl bg-slate-800 p-4"><p class="text-slate-400 text-xs uppercase mb-2">Téléphone</p><p class="font-semibold text-white">[Téléphone du site]</p></div><div class="rounded-2xl bg-slate-800 p-4"><p class="text-slate-400 text-xs uppercase mb-2">Email</p><p class="font-semibold text-white">[Email du site]</p></div><div class="rounded-2xl bg-slate-800 p-4"><p class="text-slate-400 text-xs uppercase mb-2">Réponse</p><p class="font-semibold text-white">48h ouvrées</p></div></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Equipe Experte',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Notre équipe',
        subtitle: 'Des experts certifiés pour chaque intervention.',
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Inter',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-3"><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Ingénieurs</h3><p class="text-slate-500">Conception et supervision de projets.</p></div><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Techniciens</h3><p class="text-slate-500">Mise en œuvre et maintenance spécialisée.</p></div><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Auditeurs</h3><p class="text-slate-500">Contrôle qualité et conformité réglementaire.</p></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Indicateurs de Performance',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Performance et conformité',
        subtitle: 'Des chiffres clairs pour convaincre vos partenaires.',
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        fontFamily: 'Inter',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-4"><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">100+</h3><p class="text-sm text-slate-500 mt-2">Marchés sécurisés</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">98%</h3><p class="text-sm text-slate-500 mt-2">Satisfaction client</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">24/7</h3><p class="text-sm text-slate-500 mt-2">Support continu</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">5 ans</h3><p class="text-sm text-slate-500 mt-2">Garantie d’intervention</p></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  // ═══════════════════════════════════════════════════════════════════
  // 🆕 TEMPLATES PREMIUM — Paramètres responsifs complets
  // ═══════════════════════════════════════════════════════════════════

  {
    id: uuidv4(),
    name: 'Hero Vidéo Premium',
    createdAt: Date.now(),
    thumbnail: 'hero-premium',
    block: {
      id: uuidv4(),
      type: 'hero',
      content: {
        title: 'Sécurité électrique professionnelle',
        subtitle: 'Audit · Conformité · Formation · Maintenance 24/7',
        text: 'Demander un audit gratuit',
        href: '/contact',
      },
      style: {
        padding: '160px 40px',
        backgroundImage: 'linear-gradient(135deg, #0a0f1e 0%, #1a2a6c 50%, #0a0f1e 100%)',
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Inter',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // ── Responsive padding (desktop / tablet / mobile) ──
        mobile: {
          padding: '80px 20px',
          fontSize: '14px',
          textAlign: 'center',
        },
        tablet: {
          padding: '120px 30px',
        },
        // ── Entrance animation ──
        darkStyle: {
          animation: 'fadeSlideUp 0.8s ease-out both',
        },
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div style="max-width:800px;margin:0 auto"><p style="font-size:1.2rem;color:rgba(255,255,255,0.7);margin-bottom:2rem;letter-spacing:2px;text-transform:uppercase;font-weight:500">🔌 PROQUELEC SENEGAL</p><div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem"><span style="padding:0.5rem 1.5rem;background:rgba(255,255,255,0.1);border-radius:999px;font-size:0.9rem">✓ Certifié NS 01-001</span><span style="padding:0.5rem 1.5rem;background:rgba(255,255,255,0.1);border-radius:999px;font-size:0.9rem">✓ 15 ans d\'expérience</span><span style="padding:0.5rem 1.5rem;background:rgba(255,255,255,0.1);border-radius:999px;font-size:0.9rem">✓ Intervention 24/7</span></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
            animation: 'fadeIn 1s ease-out 0.3s both',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Cartes Tarifs Premium',
    createdAt: Date.now(),
    thumbnail: 'pricing',
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Nos offres adaptées à vos besoins',
        subtitle: 'Du diagnostic ponctuel au contrat de maintenance global.',
      },
      style: {
        padding: '100px 30px',
        backgroundColor: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        textAlign: 'center',
        fontFamily: 'Inter',
        // ── Responsive breakpoints ──
        mobile: {
          padding: '50px 16px',
        },
        tablet: {
          padding: '70px 24px',
        },
        // ── Entrance animation ──
        animation: 'fadeIn 0.6s ease-out both',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto" style="margin-top:3rem"><div class="relative rounded-3xl p-8 bg-white border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"><div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2376df;margin-bottom:1rem">🔎 Diagnostic</div><div style="font-size:2.5rem;font-weight:900;color:#0f172a;margin-bottom:0.5rem">150 000 <span style="font-size:1rem;font-weight:400;color:#64748b">FCFA</span></div><p style="color:#64748b;font-size:0.9rem;margin-bottom:1.5rem">Audit complet + rapport</p><ul style="list-style:none;padding:0;margin:0;text-align:left;color:#334155;font-size:0.9rem;margin-bottom:2rem"><li style="padding:0.5rem 0;border-bottom:1px solid #f1f5f9">✅ Visite technique</li><li style="padding:0.5rem 0;border-bottom:1px solid #f1f5f9">✅ Rapport détaillé</li><li style="padding:0.5rem 0;border-bottom:1px solid #f1f5f9">✅ Recommandations</li></ul><a href="/contact" style="display:block;text-align:center;padding:0.8rem;border-radius:999px;background:#2376df;color:white;font-weight:600;text-decoration:none">Choisir</a></div><div class="relative rounded-3xl p-8 bg-gradient-to-b from-blue-950 to-slate-900 text-white border-2 border-blue-500 shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-300 scale-105"><div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#0f172a;font-size:0.7rem;font-weight:800;padding:0.25rem 1rem;border-radius:999px;text-transform:uppercase">🌟 Populaire</div><div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#93c5fd;margin-top:1rem;margin-bottom:1rem">⚡ Conformité</div><div style="font-size:2.5rem;font-weight:900;margin-bottom:0.5rem">350 000 <span style="font-size:1rem;font-weight:400;color:#94a3b8">FCFA</span></div><p style="color:#94a3b8;font-size:0.9rem;margin-bottom:1.5rem">Mise aux normes complète</p><ul style="list-style:none;padding:0;margin:0;text-align:left;color:#cbd5e1;font-size:0.9rem;margin-bottom:2rem"><li style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.1)">✅ Diagnostic + devis</li><li style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.1)">✅ Remplacement tableau</li><li style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.1)">✅ Certificat conformité</li></ul><a href="/contact" style="display:block;text-align:center;padding:0.8rem;border-radius:999px;background:#f59e0b;color:#0f172a;font-weight:700;text-decoration:none">Choisir</a></div><div class="relative rounded-3xl p-8 bg-white border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"><div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2376df;margin-bottom:1rem">🔧 Maintenance</div><div style="font-size:2.5rem;font-weight:900;color:#0f172a;margin-bottom:0.5rem">600 000 <span style="font-size:1rem;font-weight:400;color:#64748b">FCFA/an</span></div><p style="color:#64748b;font-size:0.9rem;margin-bottom:1.5rem">Contrat annuel premium</p><ul style="list-style:none;padding:0;margin:0;text-align:left;color:#334155;font-size:0.9rem;margin-bottom:2rem"><li style="padding:0.5rem 0;border-bottom:1px solid #f1f5f9">✅ 4 visites préventives</li><li style="padding:0.5rem 0;border-bottom:1px solid #f1f5f9">✅ Dépannage prioritaire</li><li style="padding:0.5rem 0;border-bottom:1px solid #f1f5f9">✅ Rapport trimestriel</li></ul><a href="/contact" style="display:block;text-align:center;padding:0.8rem;border-radius:999px;background:#2376df;color:white;font-weight:600;text-decoration:none">Choisir</a></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Processus en 4 Étapes',
    createdAt: Date.now(),
    thumbnail: 'process',
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Comment ça marche ?',
        subtitle: 'Un processus simple et transparent en 4 étapes.',
      },
      style: {
        padding: '100px 30px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Inter',
        // ── Responsive ──
        mobile: {
          padding: '50px 16px',
        },
        // ── Animation ──
        animation: 'fadeIn 0.5s ease-out both',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-8 md:grid-cols-4 max-w-6xl mx-auto" style="margin-top:3rem;position:relative"><div style="text-align:center;padding:2rem 1rem"><div style="width:64px;height:64px;margin:0 auto 1.5rem;background:linear-gradient(135deg,#2376df,#1a5bbf);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;color:white;box-shadow:0 10px 30px rgba(35,118,223,0.3)">1</div><h3 style="font-size:1.1rem;font-weight:700;margin-bottom:0.5rem">Contact</h3><p style="font-size:0.85rem;color:#94a3b8;line-height:1.6">Vous nous appelez ou remplissez le formulaire en ligne.</p></div><div style="text-align:center;padding:2rem 1rem"><div style="width:64px;height:64px;margin:0 auto 1.5rem;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;color:white;box-shadow:0 10px 30px rgba(245,158,11,0.3)">2</div><h3 style="font-size:1.1rem;font-weight:700;margin-bottom:0.5rem">Diagnostic</h3><p style="font-size:0.85rem;color:#94a3b8;line-height:1.6">Nos experts réalisent un audit complet de votre installation.</p></div><div style="text-align:center;padding:2rem 1rem"><div style="width:64px;height:64px;margin:0 auto 1.5rem;background:linear-gradient(135deg,#10b981,#059669);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;color:white;box-shadow:0 10px 30px rgba(16,185,129,0.3)">3</div><h3 style="font-size:1.1rem;font-weight:700;margin-bottom:0.5rem">Devis</h3><p style="font-size:0.85rem;color:#94a3b8;line-height:1.6">Recevez une proposition claire et sans engagement.</p></div><div style="text-align:center;padding:2rem 1rem"><div style="width:64px;height:64px;margin:0 auto 1.5rem;background:linear-gradient(135deg,#8b5cf6,#7c3aed);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;color:white;box-shadow:0 10px 30px rgba(139,92,246,0.3)">4</div><h3 style="font-size:1.1rem;font-weight:700;margin-bottom:0.5rem">Réalisation</h3><p style="font-size:0.85rem;color:#94a3b8;line-height:1.6">Notre équipe intervient dans les délais convenus.</p></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Portfolio & Réalisations',
    createdAt: Date.now(),
    thumbnail: 'portfolio',
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Nos dernières réalisations',
        subtitle: "Des projets variés, de l'habitat individuel aux grands comptes.",
      },
      style: {
        padding: '90px 30px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Inter',
        mobile: {
          padding: '50px 16px',
        },
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto" style="margin-top:3rem"><div class="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"><img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80" alt="Installation électrique immeuble" style="width:100%;height:280px;object-fit:cover;transition:transform 0.5s" class="group-hover:scale-110" /><div style="position:absolute;bottom:0;left:0;right:0;padding:2rem 1.5rem;background:linear-gradient(transparent,rgba(0,0,0,0.8))"><h3 style="color:white;font-weight:700;font-size:1.1rem">Immeuble Panoramique</h3><p style="color:rgba(255,255,255,0.7);font-size:0.85rem">Dakar · 2025</p></div></div><div class="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"><img src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=600&q=80" alt="Tableau électrique industriel" style="width:100%;height:280px;object-fit:cover;transition:transform 0.5s" class="group-hover:scale-110" /><div style="position:absolute;bottom:0;left:0;right:0;padding:2rem 1.5rem;background:linear-gradient(transparent,rgba(0,0,0,0.8))"><h3 style="color:white;font-weight:700;font-size:1.1rem">Usine SABODALA</h3><p style="color:rgba(255,255,255,0.7);font-size:0.85rem">Thiès · 2024</p></div></div><div class="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"><img src="https://images.unsplash.com/photo-1523730205978-59fd1b2965e3?w=600&q=80" alt="Installation hôtelière" style="width:100%;height:280px;object-fit:cover;transition:transform 0.5s" class="group-hover:scale-110" /><div style="position:absolute;bottom:0;left:0;right:0;padding:2rem 1.5rem;background:linear-gradient(transparent,rgba(0,0,0,0.8))"><h3 style="color:white;font-weight:700;font-size:1.1rem">Hôtel Terrou-Bi</h3><p style="color:rgba(255,255,255,0.7);font-size:0.85rem">Dakar · 2024</p></div></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Logo Cloud Partenaires',
    createdAt: Date.now(),
    thumbnail: 'partners',
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Ils nous font confiance',
        subtitle: 'Partenaires techniques, institutionnels et clients premium.',
      },
      style: {
        padding: '60px 30px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        fontFamily: 'Inter',
        mobile: {
          padding: '40px 16px',
        },
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div style="max-width:1000px;margin:2rem auto 0;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:2.5rem;opacity:0.7"><div style="padding:1rem 2rem;background:white;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.05);font-weight:700;color:#334155;font-size:1.1rem">🏗️ Eiffage</div><div style="padding:1rem 2rem;background:white;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.05);font-weight:700;color:#334155;font-size:1.1rem">🏦 BHS</div><div style="padding:1rem 2rem;background:white;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.05);font-weight:700;color:#334155;font-size:1.1rem">🏨 Radisson Blu</div><div style="padding:1rem 2rem;background:white;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.05);font-weight:700;color:#334155;font-size:1.1rem">⚡ SENELEC</div><div style="padding:1rem 2rem;background:white;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.05);font-weight:700;color:#334155;font-size:1.1rem">🏭 SOCABEG</div><div style="padding:1rem 2rem;background:white;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.05);font-weight:700;color:#334155;font-size:1.1rem">🎓 UVS</div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Timeline Engagements',
    createdAt: Date.now(),
    thumbnail: 'timeline',
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Notre parcours',
        subtitle: 'Des étapes clés qui font notre différence depuis 15 ans.',
      },
      style: {
        padding: '90px 30px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Inter',
        mobile: {
          padding: '50px 16px',
        },
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div style="max-width:800px;margin:3rem auto 0;position:relative;padding-left:3rem"><div style="position:absolute;left:12px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,#2376df,#10b981)"></div><div style="position:relative;margin-bottom:2.5rem;padding-left:1rem"><div style="position:absolute;left:-3rem;top:4px;width:24px;height:24px;background:#2376df;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #2376df"></div><h3 style="font-size:1.1rem;font-weight:700;color:#0f172a">2010 — Fondation</h3><p style="color:#64748b;font-size:0.9rem;margin-top:0.3rem">Création de PROQUELEC avec une vision : la sécurité électrique pour tous.</p></div><div style="position:relative;margin-bottom:2.5rem;padding-left:1rem"><div style="position:absolute;left:-3rem;top:4px;width:24px;height:24px;background:#f59e0b;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #f59e0b"></div><h3 style="font-size:1.1rem;font-weight:700;color:#0f172a">2015 — Certification</h3><p style="color:#64748b;font-size:0.9rem;margin-top:0.3rem">Obtention de la certification NS 01-001 et agrément SENELEC.</p></div><div style="position:relative;margin-bottom:2.5rem;padding-left:1rem"><div style="position:absolute;left:-3rem;top:4px;width:24px;height:24px;background:#10b981;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #10b981"></div><h3 style="font-size:1.1rem;font-weight:700;color:#0f172a">2020 — Expansion</h3><p style="color:#64748b;font-size:0.9rem;margin-top:0.3rem">Ouverture de 3 agences régionales et équipe de 50 techniciens.</p></div><div style="position:relative;padding-left:1rem"><div style="position:absolute;left:-3rem;top:4px;width:24px;height:24px;background:#8b5cf6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #8b5cf6"></div><h3 style="font-size:1.1rem;font-weight:700;color:#0f172a">2025 — Innovation</h3><p style="color:#64748b;font-size:0.9rem;margin-top:0.3rem">Lancement de la plateforme digitale de suivi et de gestion des contrats.</p></div></div>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
            animation: 'fadeSlideUp 0.8s ease-out both',
          },
        },
      ],
    },
  },
  {
    id: uuidv4(),
    name: 'Page Modèle',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Page Modèle Builder',
        subtitle: 'Un modèle complet pour tester toutes les capacités du builder.',
      },
      style: {
        padding: '0',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'Inter',
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<section class="bg-gradient-to-r from-sky-700 via-indigo-900 to-slate-900 text-white py-32"><div class="max-w-6xl mx-auto px-6 text-center"><h1 class="text-5xl md:text-6xl font-extrabold mb-6">Testez le Builder avec un modèle complet</h1><p class="max-w-3xl mx-auto text-lg md:text-xl text-slate-200 mb-8">Hero, fonctionnalités, chiffres clés, témoignages, tarifs et FAQ — tout est présent pour valider le rendu et la personnalisation.</p><a href="#" class="inline-flex items-center justify-center rounded-full bg-amber-400 px-8 py-3 text-base font-semibold text-slate-950 shadow-xl hover:bg-amber-300 transition">Démarrer le test</a></div></section>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<section class="bg-white py-24"><div class="max-w-6xl mx-auto px-6 grid gap-8 lg:grid-cols-3"><div class="rounded-3xl p-8 border border-slate-200 shadow-sm"><h2 class="text-2xl font-semibold mb-4">Modules multi-usages</h2><p class="text-slate-600">Un ensemble prêt à l’emploi pour tester des blocs de contenu et des sections visuelles.</p></div><div class="rounded-3xl p-8 border border-slate-200 shadow-sm"><h2 class="text-2xl font-semibold mb-4">Hero enrichi</h2><p class="text-slate-600">Section d’accueil immersive avec CTA, visuels et message premium.</p></div><div class="rounded-3xl p-8 border border-slate-200 shadow-sm"><h2 class="text-2xl font-semibold mb-4">Validation UX</h2><p class="text-slate-600">Navigation fluide et composants testés pour l’édition en temps réel.</p></div></div></section>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<section class="bg-slate-950 text-white py-24"><div class="max-w-6xl mx-auto px-6 grid gap-6 md:grid-cols-3"><div class="p-8 bg-slate-900 rounded-3xl shadow-xl"><h3 class="text-3xl font-bold mb-3">150+</h3><p class="text-slate-300">Projets testés</p></div><div class="p-8 bg-slate-900 rounded-3xl shadow-xl"><h3 class="text-3xl font-bold mb-3">99%</h3><p class="text-slate-300">Interfaces réactives</p></div><div class="p-8 bg-slate-900 rounded-3xl shadow-xl"><h3 class="text-3xl font-bold mb-3">24/7</h3><p class="text-slate-300">Support de test</p></div></div></section>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<section class="bg-white py-24"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-semibold mb-8 text-center">Témoignages et retours</h2><div class="grid gap-6 md:grid-cols-2"><div class="rounded-3xl p-8 border border-slate-200 shadow-sm"><p class="text-slate-600 mb-4">« Le builder supporte parfaitement des pages complexes et des composants variés. »</p><span class="font-semibold">- Client test 1</span></div><div class="rounded-3xl p-8 border border-slate-200 shadow-sm"><p class="text-slate-600 mb-4">« Nous avons pu monter un prototype très rapidement. »</p><span class="font-semibold">- Client test 2</span></div></div></div></section>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<section class="bg-slate-100 py-24"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-semibold mb-8 text-center">FAQ de test</h2><div class="space-y-4"><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="font-semibold mb-2">Comment personnaliser ce modèle ?</h3><p class="text-slate-600">Utilisez le builder pour modifier le hero, les sections et les styles en temps réel.</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="font-semibold mb-2">Est-ce que les sections sont réordonnables ?</h3><p class="text-slate-600">Oui, chaque bloc est conçu pour être déplacé et configuré dynamiquement.</p></div></div></div></section>',
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter',
          },
        },
      ],
    },
  },
];

export interface PageMetadata {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_robots?: 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow';
  featured_image?: string;
  language_code?: string;

  is_published?: boolean;
  publish_date?: string;
  unpublish_date?: string;
  workflow_status?: 'draft' | 'review' | 'approved' | 'published';

  author?: string;
  reading_time?: number;
  categories?: string[];
  tags?: string[];

  // Hero Section Metadata
  hero_title?: string;
  hero_subtitle?: string;
  hero_background_image?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;

  template?: string;
  show_hero?: boolean;
  show_footer?: boolean;

  custom_css?: string;
  custom_js?: string;
  header_html?: string;
  footer_html?: string;
  menu_order?: number;
}

interface BuilderState {
  blocks: Block[];
  selectedBlockId: string | null;
  pageMetadata: PageMetadata;

  // Undo/Redo
  history: Block[][];
  historyIndex: number;

  // Templates
  templates: BlockTemplate[];

  // Actions
  setBlocks: (blocks: Block[]) => void;
  addBlock: (type: string, parentId?: string, index?: number) => void;
  importBlock: (block: Block, parentId?: string, index?: number) => void;
  moveBlock: (activeId: string, overId: string) => void;
  selectBlock: (id: string | null) => void;

  setPageMetadata: (metadata: Partial<PageMetadata>) => void;

  // Block Update Actions
  updateBlockStyle: (id: string, style: Partial<BlockStyle>) => void;
  updateBlockContent: (id: string, content: Partial<BlockContent>) => void;
  removeBlock: (id: string) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  snapshotHistory: () => void;

  // Template Actions
  saveTemplate: (block: Block, name: string) => void;
  deleteTemplate: (templateId: string) => void;
  loadTemplates: () => void;
}

// Helpers
const updateBlockRecursive = (
  blocks: Block[],
  id: string,
  updater: (b: Block) => Block,
): Block[] => {
  return blocks.map((b) => {
    if (b.id === id) return updater(b);
    if (b.children && b.children.length > 0) {
      return { ...b, children: updateBlockRecursive(b.children, id, updater) };
    }
    return b;
  });
};

const removeBlockRecursive = (blocks: Block[], id: string): Block[] => {
  return blocks
    .filter((b) => b.id !== id)
    .map((b) => ({
      ...b,
      children: b.children ? removeBlockRecursive(b.children, id) : undefined,
    }));
};

const cloneBlock = (block: Block): Block => {
  const newBlock = { ...block, id: uuidv4() };
  if (newBlock.children) {
    newBlock.children = newBlock.children.map((child) => cloneBlock(child));
  }
  return newBlock;
};

const countBlocks = (block: Block): number => {
  let count = 1;
  if (block.children) {
    for (const child of block.children) {
      count += countBlocks(child);
    }
  }
  return count;
};

const findBlockRecursive = (blocks: Block[], id: string): Block | undefined => {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const found = findBlockRecursive(b.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

const insertBlockRecursive = (
  blocks: Block[],
  newBlock: Block,
  parentId?: string,
  index?: number,
): Block[] => {
  if (!parentId) {
    const newBlocks = [...blocks];
    if (typeof index === 'number') newBlocks.splice(index, 0, newBlock);
    else newBlocks.push(newBlock);
    return newBlocks;
  }
  return blocks.map((b) => {
    if (b.id === parentId) {
      const children = b.children ? [...b.children] : [];
      if (typeof index === 'number') children.splice(index, 0, newBlock);
      else children.push(newBlock);
      return { ...b, children };
    }
    if (b.children) {
      return { ...b, children: insertBlockRecursive(b.children, newBlock, parentId, index) };
    }
    return b;
  });
};

const findBlockParent = (
  blocks: Block[],
  id: string,
  parent?: Block,
): { block: Block; parent: Block | undefined; index: number } | null => {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === id) {
      return { block: blocks[i], parent, index: i };
    }
    if (blocks[i].children) {
      const found = findBlockParent(blocks[i].children!, id, blocks[i]);
      if (found) return found;
    }
  }
  return null;
};

// Helper: Save current state to history using deep clones for reliable undo/redo
const saveHistory = (state: BuilderState): Partial<BuilderState> => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(cloneDeep(state.blocks));

  if (newHistory.length > 20) newHistory.shift(); // Limit to 20 steps

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  selectedBlockId: null,
  pageMetadata: {},
  history: [],
  historyIndex: -1,
  templates: DEFAULT_BUILDER_TEMPLATES,

  setPageMetadata: (metadata) => {
    const previous = { ...useBuilderStore.getState().pageMetadata };
    set((state) => ({
      pageMetadata: { ...state.pageMetadata, ...metadata },
    }));
    eventBus.emit('page:metadata:updated', { previous, next: metadata });
  },

  setBlocks: (blocks) => {
    const cloned = cloneDeep(blocks);
    set({ blocks: cloned, history: [cloned], historyIndex: 0 });
    eventBus.emit('state:changed', { action: 'setBlocks', timestamp: Date.now() });
  },

  addBlock: (type, parentId, index) => {
    let createdBlock: Block | null = null;
    set((state) => {
      const historyUpdate = saveHistory(state);

      const newBlock: Block = {
        id: uuidv4(),
        type,
        content: { title: 'Nouveau Bloc' },
        style: { padding: '20px' },
        children: [],
      };
      createdBlock = newBlock;

      const resolvedParentId: string | undefined = parentId
        ? findBlockParent(state.blocks, parentId)
          ? parentId
          : undefined
        : undefined;

      const newBlocks = insertBlockRecursive(state.blocks, newBlock, resolvedParentId, index);

      return {
        ...historyUpdate,
        blocks: newBlocks,
      };
    });
    if (createdBlock) {
      eventBus.emit('block:created', { block: createdBlock, parentId, index });
    }
  },

  importBlock: (blockTemplate, parentId, index) => {
    let importedBlock: Block | null = null;
    set((state) => {
      const historyUpdate = saveHistory(state);
      const newBlock = cloneBlock(blockTemplate);
      importedBlock = newBlock;

      const resolvedParentId: string | undefined = parentId
        ? findBlockParent(state.blocks, parentId)
          ? parentId
          : undefined
        : undefined;

      const newBlocks = insertBlockRecursive(state.blocks, newBlock, resolvedParentId, index);

      return {
        ...historyUpdate,
        blocks: newBlocks,
      };
    });
    if (importedBlock) {
      eventBus.emit('block:imported', { block: importedBlock, parentId, index });
    }
  },

  moveBlock: (activeId, overId) => {
    let moved = false;
    let prevIdx = -1;
    let newIdx = -1;
    set((state) => {
      const historyUpdate = saveHistory(state);
      const activeInfo = findBlockParent(state.blocks, activeId);
      const overInfo = findBlockParent(state.blocks, overId);

      if (activeInfo && overInfo && activeId !== overId) {
        prevIdx = activeInfo.index;
        const sameParent = activeInfo.parent?.id === overInfo.parent?.id;
        newIdx = overInfo.index;
        if (sameParent && activeInfo.index < overInfo.index) {
          newIdx = Math.max(0, overInfo.index - 1);
        }

        const movedBlock = activeInfo.block;
        let newBlocks = removeBlockRecursive(state.blocks, activeId);
        newBlocks = insertBlockRecursive(newBlocks, movedBlock, overInfo.parent?.id, newIdx);

        moved = true;
        return {
          ...historyUpdate,
          blocks: newBlocks,
        };
      }
      return state;
    });
    if (moved) {
      eventBus.emit('block:moved', {
        activeId,
        overId,
        previousIndex: prevIdx,
        newIndex: newIdx,
      });
    }
  },

  removeBlock: (id) => {
    let deletedBlock: Block | null = null;
    let parentId: string | undefined;
    let blockIndex: number | undefined;
    set((state) => {
      const historyUpdate = saveHistory(state);
      const info = findBlockParent(state.blocks, id);
      if (info) {
        deletedBlock = info.block;
        parentId = info.parent?.id;
        blockIndex = info.index;
      }
      return {
        ...historyUpdate,
        blocks: removeBlockRecursive(state.blocks, id),
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
      };
    });
    if (deletedBlock) {
      eventBus.emit('block:deleted', {
        id,
        block: deletedBlock,
        parentId,
        index: blockIndex,
      });
    }
  },

  updateBlockContent: (id, content) => {
    set((state) => ({
      blocks: updateBlockRecursive(state.blocks, id, (b) => ({
        ...b,
        content: { ...b.content, ...content },
      })),
    }));
  },

  updateBlockStyle: (id, style) => {
    set((state) => ({
      blocks: updateBlockRecursive(state.blocks, id, (b) => ({
        ...b,
        style: { ...b.style, ...style },
      })),
    }));
  },

  snapshotHistory: () => {
    set((state) => saveHistory(state));
    const { blocks, history } = useBuilderStore.getState();
    eventBus.emit('history:snapshot:created', {
      snapshot: {
        id: uuidv4(),
        label: `Snapshot #${history.length}`,
        timestamp: Date.now(),
        type: 'auto',
      },
      blocksCount: blocks.length,
    });
  },

  selectBlock: (id) => {
    const previousId = useBuilderStore.getState().selectedBlockId;
    set({ selectedBlockId: id });
    eventBus.emit('block:selected', { id, previousId });
  },

  // --- Undo / Redo ---
  undo: () => {
    const prevIndex = useBuilderStore.getState().historyIndex;
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          blocks: cloneDeep(state.history[newIndex]),
          historyIndex: newIndex,
        };
      }
      return {};
    });
    const newIndex = useBuilderStore.getState().historyIndex;
    if (newIndex !== prevIndex) {
      eventBus.emit('history:undo', { fromIndex: prevIndex, toIndex: newIndex });
    }
  },

  redo: () => {
    const prevIndex = useBuilderStore.getState().historyIndex;
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          blocks: cloneDeep(state.history[newIndex]),
          historyIndex: newIndex,
        };
      }
      return {};
    });
    const newIndex = useBuilderStore.getState().historyIndex;
    if (newIndex !== prevIndex) {
      eventBus.emit('history:redo', { fromIndex: prevIndex, toIndex: newIndex });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // --- Template Actions ---
  saveTemplate: (block, name) => {
    const newTemplate: BlockTemplate = {
      id: uuidv4(),
      name,
      block: cloneDeep(block),
      createdAt: Date.now(),
    };

    set((state) => {
      const updatedTemplates = [...state.templates, newTemplate];
      secureSetItem('builder_templates', updatedTemplates);
      return { templates: updatedTemplates };
    });
    eventBus.emit('template:saved', { name, blocksCount: countBlocks(block) });
  },

  deleteTemplate: (templateId) => {
    let templateName = '';
    set((state) => {
      const target = state.templates.find((t) => t.id === templateId);
      if (target) templateName = target.name;
      const updatedTemplates = state.templates.filter((t) => t.id !== templateId);
      secureSetItem('builder_templates', updatedTemplates);
      return { templates: updatedTemplates };
    });
    if (templateName) {
      eventBus.emit('template:deleted', { id: templateId, name: templateName });
    }
  },

  loadTemplates: () => {
    try {
      const stored = secureGetItem<BlockTemplate[]>('builder_templates', []);
      if (stored) {
        try {
          if (Array.isArray(stored)) {
            set({ templates: [...DEFAULT_BUILDER_TEMPLATES, ...stored] });
            return;
          }
        } catch (e) {
          console.error('Failed to load templates', e);
          // Clear corrupted data
          localStorage.removeItem('builder_templates');
        }
      }

      set({ templates: DEFAULT_BUILDER_TEMPLATES });
      secureSetItem('builder_templates', DEFAULT_BUILDER_TEMPLATES);
    } catch (error) {
      console.error('[BuilderStore] Error in loadTemplates:', error);
      // Fallback to default templates
      set({ templates: DEFAULT_BUILDER_TEMPLATES });
    }
  },
}));
