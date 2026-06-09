export interface Theme {
  id: string;
  name: string;
  family: 'corporate' | 'creative' | 'nature' | 'luxury' | 'tech' | 'minimal' | 'vibrant' | 'elegant';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: number;
  shadow: 'sm' | 'md' | 'lg';
}

export const THEMES: Theme[] = [
  // ── Corporate (10) ──
  { id: 'corp-1', name: 'Corporate Bleu', family: 'corporate', colors: { primary: '#1e40af', secondary: '#0f172a', accent: '#3b82f6', background: '#ffffff', surface: '#f8fafc', text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'corp-2', name: 'Corporate Marine', family: 'corporate', colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#475569', background: '#ffffff', surface: '#f1f5f9', text: '#020617', textMuted: '#64748b', border: '#e2e8f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 6, shadow: 'sm' },
  { id: 'corp-3', name: 'Executive Navy', family: 'corporate', colors: { primary: '#1e3a5f', secondary: '#0d2137', accent: '#4a90d9', background: '#ffffff', surface: '#f2f6fc', text: '#0d2137', textMuted: '#5a7a9a', border: '#d4e0ec' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'corp-4', name: 'Finance Dark', family: 'corporate', colors: { primary: '#0a1628', secondary: '#1a2d44', accent: '#c9a84c', background: '#f8fafc', surface: '#ffffff', text: '#0a1628', textMuted: '#5a7a9a', border: '#e2e8f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 4, shadow: 'sm' },
  { id: 'corp-5', name: 'Assurance Vert', family: 'corporate', colors: { primary: '#0d5e3a', secondary: '#072e1c', accent: '#14b86b', background: '#ffffff', surface: '#f0faf5', text: '#072e1c', textMuted: '#5a9a7a', border: '#d4ece0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 6, shadow: 'md' },
  { id: 'corp-6', name: 'Legal Burgundy', family: 'corporate', colors: { primary: '#4a0e2e', secondary: '#2d031a', accent: '#9a4a6a', background: '#fcf8fa', surface: '#faf5f8', text: '#2d031a', textMuted: '#8a6a7a', border: '#e8dce4' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 4, shadow: 'sm' },
  { id: 'corp-7', name: 'Consulting Teal', family: 'corporate', colors: { primary: '#0d4f4f', secondary: '#062828', accent: '#2a9d9d', background: '#ffffff', surface: '#f0fafa', text: '#062828', textMuted: '#5a8a8a', border: '#d4ecec' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 6, shadow: 'md' },
  { id: 'corp-8', name: 'Real Estate Warm', family: 'corporate', colors: { primary: '#8b5e3c', secondary: '#4a2e1a', accent: '#c4956a', background: '#fefcf9', surface: '#faf5ef', text: '#2a1a0a', textMuted: '#8a7a6a', border: '#ece4d4' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'corp-9', name: 'Corporate Slate', family: 'corporate', colors: { primary: '#334155', secondary: '#1e293b', accent: '#64748b', background: '#ffffff', surface: '#f8fafc', text: '#0f172a', textMuted: '#94a3b8', border: '#e2e8f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 6, shadow: 'sm' },
  { id: 'corp-10', name: 'Agency White', family: 'corporate', colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#f97316', background: '#ffffff', surface: '#f8fafc', text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 8, shadow: 'md' },

  // ── Creative (8) ──
  { id: 'crea-1', name: 'Créatif Coral', family: 'creative', colors: { primary: '#e85d5d', secondary: '#2d1b1b', accent: '#ff9a76', background: '#ffffff', surface: '#fff5f3', text: '#2d1b1b', textMuted: '#a07a7a', border: '#f0e0e0' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 12, shadow: 'lg' },
  { id: 'crea-2', name: 'Studio Violet', family: 'creative', colors: { primary: '#7c3aed', secondary: '#1e0a3c', accent: '#a78bfa', background: '#ffffff', surface: '#f5f0ff', text: '#1e0a3c', textMuted: '#7a6a9a', border: '#e0d4f0' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 16, shadow: 'lg' },
  { id: 'crea-3', name: 'Portfolio Rose', family: 'creative', colors: { primary: '#db2777', secondary: '#1a0a14', accent: '#f472b6', background: '#fff5f9', surface: '#fef9fb', text: '#1a0a14', textMuted: '#8a6a7a', border: '#f0e0e8' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 12, shadow: 'lg' },
  { id: 'crea-4', name: 'Design Jaune', family: 'creative', colors: { primary: '#f59e0b', secondary: '#1a1400', accent: '#fbbf24', background: '#ffffff', surface: '#fffdf5', text: '#1a1400', textMuted: '#8a7a5a', border: '#f0ece0' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 16, shadow: 'lg' },
  { id: 'crea-5', name: 'Art Déco', family: 'creative', colors: { primary: '#0d9488', secondary: '#042f2e', accent: '#5eead4', background: '#f0fdfa', surface: '#ffffff', text: '#042f2e', textMuted: '#5a8a7a', border: '#d4ecec' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 12, shadow: 'md' },
  { id: 'crea-6', name: 'Photography Dark', family: 'creative', colors: { primary: '#1a1a2e', secondary: '#0a0a14', accent: '#e94560', background: '#0a0a14', surface: '#1a1a2e', text: '#ffffff', textMuted: '#8a8aaa', border: '#2a2a4e' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 8, shadow: 'lg' },
  { id: 'crea-7', name: 'Fashion Noir', family: 'creative', colors: { primary: '#000000', secondary: '#1a1a1a', accent: '#ffffff', background: '#ffffff', surface: '#f5f5f5', text: '#000000', textMuted: '#6a6a6a', border: '#e0e0e0' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 0, shadow: 'sm' },
  { id: 'crea-8', name: 'Aquarelle', family: 'creative', colors: { primary: '#38bdf8', secondary: '#0c4a6e', accent: '#7dd3fc', background: '#f0f9ff', surface: '#ffffff', text: '#0c4a6e', textMuted: '#5a8aaa', border: '#d4ecf4' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 16, shadow: 'lg' },

  // ── Nature (7) ──
  { id: 'nat-1', name: 'Nature Forêt', family: 'nature', colors: { primary: '#166534', secondary: '#052e16', accent: '#22c55e', background: '#f0fdf4', surface: '#ffffff', text: '#052e16', textMuted: '#5a7a6a', border: '#d4ece0' }, fonts: { heading: 'Merriweather', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'nat-2', name: 'Nature Océan', family: 'nature', colors: { primary: '#0e7490', secondary: '#042f3e', accent: '#22d3ee', background: '#ecfeff', surface: '#ffffff', text: '#042f3e', textMuted: '#5a7a8a', border: '#d4ecf4' }, fonts: { heading: 'Merriweather', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'nat-3', name: 'Terre Cuite', family: 'nature', colors: { primary: '#9a3412', secondary: '#431407', accent: '#c2410c', background: '#fff7ed', surface: '#ffffff', text: '#431407', textMuted: '#8a6a5a', border: '#ece0d4' }, fonts: { heading: 'Merriweather', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'nat-4', name: 'Jardin', family: 'nature', colors: { primary: '#4d7c0f', secondary: '#1a3a00', accent: '#84cc16', background: '#f7fee7', surface: '#ffffff', text: '#1a3a00', textMuted: '#6a8a5a', border: '#dcecd4' }, fonts: { heading: 'Merriweather', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'nat-5', name: 'Montagne', family: 'nature', colors: { primary: '#1e3a5f', secondary: '#0a1a2a', accent: '#8ab4d9', background: '#f0f6fc', surface: '#ffffff', text: '#0a1a2a', textMuted: '#5a7a9a', border: '#d4e4ec' }, fonts: { heading: 'Merriweather', body: 'Inter' }, borderRadius: 6, shadow: 'sm' },
  { id: 'nat-6', name: 'Désert', family: 'nature', colors: { primary: '#b45309', secondary: '#3a1a00', accent: '#d97706', background: '#fefce8', surface: '#ffffff', text: '#3a1a00', textMuted: '#8a7a5a', border: '#ece4d4' }, fonts: { heading: 'Merriweather', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'nat-7', name: 'Lavande', family: 'nature', colors: { primary: '#6b21a8', secondary: '#2a0a4a', accent: '#a855f7', background: '#faf5ff', surface: '#ffffff', text: '#2a0a4a', textMuted: '#7a6a8a', border: '#e4d4ec' }, fonts: { heading: 'Merriweather', body: 'Inter' }, borderRadius: 12, shadow: 'md' },

  // ── Tech (8) ──
  { id: 'tech-1', name: 'Tech Bleu', family: 'tech', colors: { primary: '#2563eb', secondary: '#0f172a', accent: '#60a5fa', background: '#ffffff', surface: '#f8fafc', text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'tech-2', name: 'Startup Violet', family: 'tech', colors: { primary: '#7c3aed', secondary: '#0f0720', accent: '#8b5cf6', background: '#ffffff', surface: '#f5f0ff', text: '#0f0720', textMuted: '#6a5a8a', border: '#e0d4f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 8, shadow: 'lg' },
  { id: 'tech-3', name: 'SaaS Vert', family: 'tech', colors: { primary: '#059669', secondary: '#022c22', accent: '#34d399', background: '#ffffff', surface: '#f0fdf4', text: '#022c22', textMuted: '#5a8a6a', border: '#d4ece0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 6, shadow: 'md' },
  { id: 'tech-4', name: 'DevOps Orange', family: 'tech', colors: { primary: '#ea580c', secondary: '#1a0a00', accent: '#f97316', background: '#fff7ed', surface: '#ffffff', text: '#1a0a00', textMuted: '#8a6a4a', border: '#ece0d4' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 6, shadow: 'md' },
  { id: 'tech-5', name: 'Cyber Dark', family: 'tech', colors: { primary: '#00f0ff', secondary: '#050d1a', accent: '#00ff88', background: '#050d1a', surface: '#0a1a2a', text: '#e0f0ff', textMuted: '#5a8aaa', border: '#1a2a4a' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 4, shadow: 'lg' },
  { id: 'tech-6', name: 'Data Indigo', family: 'tech', colors: { primary: '#4338ca', secondary: '#0a0820', accent: '#6366f1', background: '#f8f8ff', surface: '#ffffff', text: '#0a0820', textMuted: '#6a6a8a', border: '#e0e0f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'tech-7', name: 'Cloud Bleu Ciel', family: 'tech', colors: { primary: '#0284c7', secondary: '#082f49', accent: '#38bdf8', background: '#ffffff', surface: '#f0f9ff', text: '#082f49', textMuted: '#5a8aaa', border: '#d4ecf4' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'tech-8', name: 'AI Rose', family: 'tech', colors: { primary: '#e11d48', secondary: '#1a0410', accent: '#fb7185', background: '#ffffff', surface: '#fff5f8', text: '#1a0410', textMuted: '#8a5a6a', border: '#f0e0e8' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 12, shadow: 'lg' },

  // ── Minimal (7) ──
  { id: 'min-1', name: 'Minimal Blanc', family: 'minimal', colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#334155', background: '#ffffff', surface: '#f8fafc', text: '#0f172a', textMuted: '#94a3b8', border: '#f1f5f9' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 4, shadow: 'sm' },
  { id: 'min-2', name: 'Minéral', family: 'minimal', colors: { primary: '#475569', secondary: '#1e293b', accent: '#64748b', background: '#f8fafc', surface: '#ffffff', text: '#0f172a', textMuted: '#cbd5e1', border: '#f1f5f9' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 2, shadow: 'sm' },
  { id: 'min-3', name: 'Paper', family: 'minimal', colors: { primary: '#292524', secondary: '#1c1917', accent: '#57534e', background: '#fafaf9', surface: '#ffffff', text: '#1c1917', textMuted: '#a8a29e', border: '#e7e5e4' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 2, shadow: 'sm' },
  { id: 'min-4', name: 'Soft Grey', family: 'minimal', colors: { primary: '#334155', secondary: '#1e293b', accent: '#475569', background: '#f8fafc', surface: '#ffffff', text: '#0f172a', textMuted: '#94a3b8', border: '#e2e8f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 4, shadow: 'sm' },
  { id: 'min-5', name: 'Clean Sans', family: 'minimal', colors: { primary: '#0a0a0a', secondary: '#1a1a1a', accent: '#3a3a3a', background: '#ffffff', surface: '#fafafa', text: '#0a0a0a', textMuted: '#a0a0a0', border: '#e5e5e5' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 0, shadow: 'sm' },
  { id: 'min-6', name: 'Light Air', family: 'minimal', colors: { primary: '#0ea5e9', secondary: '#082f49', accent: '#7dd3fc', background: '#f0f9ff', surface: '#ffffff', text: '#082f49', textMuted: '#7a9aaa', border: '#e0f0f8' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 4, shadow: 'sm' },
  { id: 'min-7', name: 'Warm Minimal', family: 'minimal', colors: { primary: '#292524', secondary: '#1c1917', accent: '#d97706', background: '#fafaf9', surface: '#ffffff', text: '#1c1917', textMuted: '#a8a29e', border: '#e7e5e4' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 4, shadow: 'sm' },

  // ── Luxury (5) ──
  { id: 'lux-1', name: 'Luxe Doré', family: 'luxury', colors: { primary: '#1a1625', secondary: '#0a0812', accent: '#c9a84c', background: '#fcfaf7', surface: '#ffffff', text: '#1a1625', textMuted: '#a09080', border: '#e8e4df' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 8, shadow: 'lg' },
  { id: 'lux-2', name: 'Champagne', family: 'luxury', colors: { primary: '#4a3825', secondary: '#2a1e10', accent: '#d4b896', background: '#fdfaf7', surface: '#ffffff', text: '#2a1e10', textMuted: '#9a8a7a', border: '#ece4dc' }, fonts: { heading: 'Playfair Display', body: 'Lora' }, borderRadius: 8, shadow: 'lg' },
  { id: 'lux-3', name: 'Noir & Or', family: 'luxury', colors: { primary: '#000000', secondary: '#1a1a1a', accent: '#bf9b30', background: '#fcfcfc', surface: '#ffffff', text: '#000000', textMuted: '#8a8a8a', border: '#e0e0e0' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 4, shadow: 'lg' },
  { id: 'lux-4', name: 'Bordeaux', family: 'luxury', colors: { primary: '#4a0e2e', secondary: '#2a0418', accent: '#8a3a5a', background: '#fdf8fa', surface: '#ffffff', text: '#2a0418', textMuted: '#8a6a7a', border: '#ece0e8' }, fonts: { heading: 'Playfair Display', body: 'Lora' }, borderRadius: 8, shadow: 'lg' },
  { id: 'lux-5', name: 'Saphir', family: 'luxury', colors: { primary: '#1a2a5a', secondary: '#0a1440', accent: '#6a8ad4', background: '#f8fafd', surface: '#ffffff', text: '#0a1440', textMuted: '#6a7a9a', border: '#e0e4f0' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 8, shadow: 'lg' },

  // ── Vibrant (5) ──
  { id: 'vib-1', name: 'Vibrant Tropic', family: 'vibrant', colors: { primary: '#0d9488', secondary: '#022c22', accent: '#f97316', background: '#ffffff', surface: '#f0fdf4', text: '#022c22', textMuted: '#5a8a6a', border: '#d4ece0' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 12, shadow: 'lg' },
  { id: 'vib-2', name: 'Sunset', family: 'vibrant', colors: { primary: '#e11d48', secondary: '#1a0410', accent: '#fb923c', background: '#fff5f5', surface: '#ffffff', text: '#1a0410', textMuted: '#8a5a6a', border: '#f0e0e8' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 12, shadow: 'lg' },
  { id: 'vib-3', name: 'Electric', family: 'vibrant', colors: { primary: '#6366f1', secondary: '#0a0820', accent: '#ec4899', background: '#f8f8ff', surface: '#ffffff', text: '#0a0820', textMuted: '#6a6a8a', border: '#e0e0f0' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 12, shadow: 'lg' },
  { id: 'vib-4', name: 'Jungle', family: 'vibrant', colors: { primary: '#059669', secondary: '#022c22', accent: '#eab308', background: '#f0fdf4', surface: '#ffffff', text: '#022c22', textMuted: '#5a8a6a', border: '#d4ece0' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 12, shadow: 'lg' },
  { id: 'vib-5', name: 'Ocean Drive', family: 'vibrant', colors: { primary: '#2563eb', secondary: '#0f172a', accent: '#06b6d4', background: '#f0f9ff', surface: '#ffffff', text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 12, shadow: 'lg' },

  // ── Expansion: Corporate (5 more) ──
  { id: 'corp-11', name: 'Corporate Rouge', family: 'corporate', colors: { primary: '#991b1b', secondary: '#1a0a0a', accent: '#ef4444', background: '#ffffff', surface: '#fef2f2', text: '#1a0a0a', textMuted: '#8a5a5a', border: '#f0e0e0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 6, shadow: 'md' },
  { id: 'corp-12', name: 'Banque Bleu Nuit', family: 'corporate', colors: { primary: '#0a1628', secondary: '#050e1a', accent: '#3b82f6', background: '#f8fafc', surface: '#ffffff', text: '#050e1a', textMuted: '#5a7a9a', border: '#e2e8f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 4, shadow: 'sm' },
  { id: 'corp-13', name: 'Logistics Orange', family: 'corporate', colors: { primary: '#c2410c', secondary: '#2a0a00', accent: '#f97316', background: '#fff7ed', surface: '#ffffff', text: '#2a0a00', textMuted: '#8a6a4a', border: '#ece0d4' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 6, shadow: 'md' },
  { id: 'corp-14', name: 'Assurance Bleu Ciel', family: 'corporate', colors: { primary: '#0369a1', secondary: '#082f49', accent: '#38bdf8', background: '#ffffff', surface: '#f0f9ff', text: '#082f49', textMuted: '#5a8aaa', border: '#d4ecf4' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'corp-15', name: 'Immobilier Sable', family: 'corporate', colors: { primary: '#a16207', secondary: '#2a1a00', accent: '#d97706', background: '#fefce8', surface: '#ffffff', text: '#2a1a00', textMuted: '#8a7a5a', border: '#ece4d4' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 8, shadow: 'md' },

  // ── Expansion: Creative (5 more) ──
  { id: 'crea-9', name: 'Creative Cyan', family: 'creative', colors: { primary: '#0891b2', secondary: '#042f3e', accent: '#22d3ee', background: '#ecfeff', surface: '#ffffff', text: '#042f3e', textMuted: '#5a8a9a', border: '#d4ecf4' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 16, shadow: 'lg' },
  { id: 'crea-10', name: 'Bubblegum', family: 'creative', colors: { primary: '#be185d', secondary: '#1a0410', accent: '#f472b6', background: '#fdf2f8', surface: '#ffffff', text: '#1a0410', textMuted: '#8a5a7a', border: '#f0e0ec' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 20, shadow: 'lg' },
  { id: 'crea-11', name: 'Mint Fresh', family: 'creative', colors: { primary: '#0d9488', secondary: '#022c22', accent: '#5eead4', background: '#f0fdfa', surface: '#ffffff', text: '#022c22', textMuted: '#5a8a7a', border: '#d4ecec' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 14, shadow: 'lg' },
  { id: 'crea-12', name: 'Pastel Dream', family: 'creative', colors: { primary: '#8b5cf6', secondary: '#1a0a3a', accent: '#c4b5fd', background: '#f5f3ff', surface: '#ffffff', text: '#1a0a3a', textMuted: '#7a6a9a', border: '#e4dcf4' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 16, shadow: 'lg' },
  { id: 'crea-13', name: 'Tangerine', family: 'creative', colors: { primary: '#ea580c', secondary: '#1a0600', accent: '#fb923c', background: '#fff7ed', surface: '#ffffff', text: '#1a0600', textMuted: '#8a6a4a', border: '#f0e4d4' }, fonts: { heading: 'Poppins', body: 'Inter' }, borderRadius: 14, shadow: 'lg' },

  // ── Expansion: Tech (5 more) ──
  { id: 'tech-9', name: 'Quantum Indigo', family: 'tech', colors: { primary: '#312e81', secondary: '#080620', accent: '#6366f1', background: '#f8f8ff', surface: '#ffffff', text: '#080620', textMuted: '#6a6a8a', border: '#e0e0f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 8, shadow: 'lg' },
  { id: 'tech-10', name: 'Byte Green', family: 'tech', colors: { primary: '#047857', secondary: '#022c22', accent: '#10b981', background: '#f0fdf4', surface: '#ffffff', text: '#022c22', textMuted: '#5a8a6a', border: '#d4ece0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 6, shadow: 'md' },
  { id: 'tech-11', name: 'Neon Cyber', family: 'tech', colors: { primary: '#00ff88', secondary: '#0a0a0a', accent: '#ff00ff', background: '#0a0a0a', surface: '#1a1a2a', text: '#00ff88', textMuted: '#6a8a6a', border: '#2a3a2a' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 4, shadow: 'lg' },
  { id: 'tech-12', name: 'Silicon Valley', family: 'tech', colors: { primary: '#2563eb', secondary: '#0f172a', accent: '#f59e0b', background: '#ffffff', surface: '#f8fafc', text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'tech-13', name: 'Deep Tech', family: 'tech', colors: { primary: '#0a0a2a', secondary: '#05051a', accent: '#4a4aff', background: '#0a0a2a', surface: '#10103a', text: '#e0e0ff', textMuted: '#6a6aaa', border: '#2a2a5a' }, fonts: { heading: 'Inter', body: 'Inter' }, borderRadius: 4, shadow: 'lg' },

  // ── Expansion: Elegant (5 more) ──
  { id: 'eleg-1', name: 'Timeless Navy', family: 'elegant', colors: { primary: '#0f1a2e', secondary: '#080e1a', accent: '#8a9ab8', background: '#f8f9fc', surface: '#ffffff', text: '#080e1a', textMuted: '#7a8a9a', border: '#e2e6ec' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 8, shadow: 'md' },
  { id: 'eleg-2', name: 'Velvet Rose', family: 'elegant', colors: { primary: '#2d0a1a', secondary: '#1a0410', accent: '#c44a7a', background: '#fdf8fa', surface: '#ffffff', text: '#1a0410', textMuted: '#8a6a7a', border: '#e8dce4' }, fonts: { heading: 'Playfair Display', body: 'Lora' }, borderRadius: 8, shadow: 'lg' },
  { id: 'eleg-3', name: 'Pearl White', family: 'elegant', colors: { primary: '#2a2a3a', secondary: '#1a1a2a', accent: '#c0c0d0', background: '#fcfcfe', surface: '#ffffff', text: '#1a1a2a', textMuted: '#8a8a9a', border: '#e8e8f0' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 4, shadow: 'sm' },
  { id: 'eleg-4', name: 'Forest Pine', family: 'elegant', colors: { primary: '#0a2e1a', secondary: '#041a0e', accent: '#4a8a6a', background: '#f8fcf9', surface: '#ffffff', text: '#041a0e', textMuted: '#6a8a7a', border: '#e0ece4' }, fonts: { heading: 'Playfair Display', body: 'Lora' }, borderRadius: 8, shadow: 'md' },
  { id: 'eleg-5', name: 'Mocha Brown', family: 'elegant', colors: { primary: '#3a2a1a', secondary: '#1a1008', accent: '#a08060', background: '#faf8f5', surface: '#ffffff', text: '#1a1008', textMuted: '#8a7a6a', border: '#e8e4dc' }, fonts: { heading: 'Playfair Display', body: 'Inter' }, borderRadius: 6, shadow: 'md' },
];
