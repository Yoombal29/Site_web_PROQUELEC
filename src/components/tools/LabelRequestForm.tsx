import React, { useState, useRef } from 'react';
import {
  Award,
  ShieldCheck,
  FileText,
  ChevronRight,
  Download,
  Send,
  CheckCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  MessageSquare,
  Upload,
  Info,
  Star,
  Check,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface FormData {
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  typeDemande: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

const INITIAL_FORM: FormData = {
  nom: '',
  email: '',
  telephone: '',
  adresse: '',
  typeDemande: '',
  message: '',
};

const TYPES_DEMANDE = [
  { value: 'nouvelle', label: 'Nouvelle certification' },
  { value: 'renouvellement', label: 'Renouvellement' },
  { value: 'audit', label: 'Audit' },
];

const CERTIFICATION_LEVELS = [
  {
    niveau: 'Bronze',
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-600/30',
    icon: Star,
    desc: 'Conformité aux exigences de base de la norme NS 01-001',
    criteres: [
      'Respect des sections minimales de câbles',
      'Installation conforme aux schémas de liaison à la terre',
      'Protections différentielles obligatoires',
    ],
  },
  {
    niveau: 'Argent',
    color: 'text-slate-300',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/30',
    icon: Award,
    desc: 'Niveau intermédiaire avec exigences supplémentaires',
    criteres: [
      'Tous les critères du niveau Bronze',
      'Étude de chute de tension conforme',
      'Plan de câblage détaillé fourni',
    ],
  },
  {
    niveau: 'Or',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    icon: ShieldCheck,
    desc: 'Plus haut niveau de certification PROQUELEC',
    criteres: [
      'Tous les critères du niveau Argent',
      'Audit technique sur site obligatoire',
      'Bilans de puissance et dimensionnement complets',
      'Engagement de maintenance préventive',
    ],
  },
];

const ETAPES_LABEL = [
  'Prendre connaissance du référentiel PROQUELEC',
  'Préparer les documents justificatifs',
  "Remplir le formulaire de demande d'attribution",
  'Envoyer la demande pour analyse',
  "Recevoir la visite d'un expert PROQUELEC",
  'Obtenir le label et le certificat officiel',
];

// ──────────────────────────────────────────────────────────
// Composant principal
// ──────────────────────────────────────────────────────────

export default function LabelRequestForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Validation ──────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.nom.trim()) {
      newErrors.nom = 'Le nom ou raison sociale est requis';
    }

    if (!form.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!form.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^[\d\s+\-.]{6,20}$/.test(form.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }

    if (!form.adresse.trim()) {
      newErrors.adresse = "L'adresse de l'installation est requise";
    }

    if (!form.typeDemande) {
      newErrors.typeDemande = 'Veuillez sélectionner un type de demande';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Handlers ────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTypeChange = (value: string) => {
    setForm((prev) => ({ ...prev, typeDemande: value }));
    if (errors.typeDemande) {
      setErrors((prev) => ({ ...prev, typeDemande: undefined }));
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fileList = files ? Array.from(files).map((f) => f.name).join(', ') : 'Aucun fichier joint';

    const subject = encodeURIComponent(
      `Demande de label PROQUELEC - ${form.nom}`,
    );

    const body = encodeURIComponent(
      `NOUVELLE DEMANDE DE LABEL PROQUELEC
${'='.repeat(50)}

INFORMATIONS DU DEMANDEUR
--------------------------
Nom / Entreprise : ${form.nom}
Email : ${form.email}
Téléphone : ${form.telephone}
Adresse d'installation : ${form.adresse}

TYPE DE DEMANDE
----------------
${TYPES_DEMANDE.find((t) => t.value === form.typeDemande)?.label ?? form.typeDemande}

MESSAGE / NOTES
----------------
${form.message || 'Aucune note'}

DOCUMENTS FOURNIS
------------------
${fileList}

${'='.repeat(50)}
Généré depuis le portail PROQUELEC
`,
    );

    window.location.href = `mailto:proquelec@proquelec.sn?subject=${subject}&body=${body}`;

    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setFiles(null);
    setSubmitted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ─── Header ──────────────────────────────────── */}
      <div className="flex items-start gap-4 mb-2">
        <div className="w-12 h-12 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
          <Award className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-emerald-400">
            Label Qualité PROQUELEC
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Le label PROQUELEC est une certification de qualité attribuée aux
            installations électriques conformes à la norme sénégalaise NS 01-001.
            Il garantit la sécurité, la fiabilité et la performance de vos
            réalisations électriques.
          </p>
        </div>
      </div>

      {/* ─── Alert de succès ─────────────────────────── */}
      {submitted && (
        <Alert className="bg-emerald-600/10 border-emerald-500/40 text-emerald-300">
          <CheckCircle className="w-5 h-5" />
          <AlertDescription className="flex flex-col gap-2">
            <span className="font-medium">
              ✅ Demande envoyée avec succès !
            </span>
            <span className="text-sm text-emerald-300/80">
              Votre demande a été transmise à{' '}
              <strong className="text-emerald-200">proquelec@proquelec.sn</strong>.
              Un expert PROQUELEC vous contactera dans les plus brefs délais.
              Vous pouvez également nous joindre par téléphone au
              <strong className="text-emerald-200"> +221 33 123 45 67</strong>.
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── COLONNE PRINCIPALE : FORMULAIRE ─────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ─── Niveaux de certification ──────────────── */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
                <ShieldCheck className="w-5 h-5" />
                Niveaux de certification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CERTIFICATION_LEVELS.map((level) => {
                  const Icon = level.icon;
                  return (
                    <div
                      key={level.niveau}
                      className={`rounded-lg border ${level.border} ${level.bg} p-4`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${level.color}`} />
                        <span className={`font-bold text-lg ${level.color}`}>
                          {level.niveau}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        {level.desc}
                      </p>
                      <ul className="space-y-1">
                        {level.criteres.map((c) => (
                          <li
                            key={c}
                            className="flex items-start gap-1.5 text-xs text-slate-400"
                          >
                            <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ─── Étapes ────────────────────────────────── */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
                <ClipboardList className="w-5 h-5" />
                Démarche d'obtention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {ETAPES_LABEL.map((etape, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600/20 text-emerald-400 text-sm font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-slate-300 pt-1">{etape}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* ─── Formulaire ────────────────────────────── */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
                <FileText className="w-5 h-5" />
                Formulaire de demande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nom */}
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-slate-300 font-medium">
                    <Building2 className="w-3.5 h-3.5 inline mr-1.5" />
                    Nom du demandeur / Entreprise
                  </Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Nom complet ou raison sociale"
                    className={`bg-emerald-900/20 border-emerald-800/40 text-white ${
                      errors.nom ? 'border-red-500/60' : ''
                    }`}
                  />
                  {errors.nom && (
                    <p className="text-xs text-red-400 mt-1">{errors.nom}</p>
                  )}
                </div>

                {/* Email et Téléphone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300 font-medium">
                      <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="exemple@proquelec.sn"
                      className={`bg-emerald-900/20 border-emerald-800/40 text-white ${
                        errors.email ? 'border-red-500/60' : ''
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="text-slate-300 font-medium">
                      <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                      Téléphone
                    </Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      value={form.telephone}
                      onChange={handleChange}
                      placeholder="77 123 45 67"
                      className={`bg-emerald-900/20 border-emerald-800/40 text-white ${
                        errors.telephone ? 'border-red-500/60' : ''
                      }`}
                    />
                    {errors.telephone && (
                      <p className="text-xs text-red-400 mt-1">{errors.telephone}</p>
                    )}
                  </div>
                </div>

                {/* Adresse */}
                <div className="space-y-2">
                  <Label htmlFor="adresse" className="text-slate-300 font-medium">
                    <MapPin className="w-3.5 h-3.5 inline mr-1.5" />
                    Adresse de l'installation
                  </Label>
                  <Textarea
                    id="adresse"
                    name="adresse"
                    value={form.adresse}
                    onChange={handleChange}
                    placeholder="Adresse complète du site de l'installation électrique"
                    rows={2}
                    className={`bg-emerald-900/20 border-emerald-800/40 text-white resize-none ${
                      errors.adresse ? 'border-red-500/60' : ''
                    }`}
                  />
                  {errors.adresse && (
                    <p className="text-xs text-red-400 mt-1">{errors.adresse}</p>
                  )}
                </div>

                {/* Type de demande */}
                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium">
                    <FileCheck className="w-3.5 h-3.5 inline mr-1.5" />
                    Type de demande
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TYPES_DEMANDE.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeChange(type.value)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                          form.typeDemande === type.value
                            ? 'border-emerald-500/60 bg-emerald-600/15 text-emerald-300'
                            : 'border-emerald-800/40 bg-[#0d2a21]/20 text-slate-400 hover:border-emerald-700/40 hover:text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            form.typeDemande === type.value
                              ? 'border-emerald-400 bg-emerald-500'
                              : 'border-slate-600'
                          }`}
                        >
                          {form.typeDemande === type.value && (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                  {errors.typeDemande && (
                    <p className="text-xs text-red-400 mt-1">{errors.typeDemande}</p>
                  )}
                </div>

                {/* Documents justificatifs */}
                <div className="space-y-2">
                  <Label htmlFor="documents" className="text-slate-300 font-medium">
                    <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                    Documents justificatifs
                  </Label>
                  <div className="relative">
                    <Input
                      ref={fileInputRef}
                      id="documents"
                      name="documents"
                      type="file"
                      multiple
                      onChange={handleFilesChange}
                      className="bg-emerald-900/20 border-emerald-800/40 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 file:cursor-pointer cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Formats acceptés : PDF, DOC, JPG, PNG (max 10 Mo par fichier)
                  </p>
                  {files && files.length > 0 && (
                    <p className="text-xs text-emerald-400">
                      {files.length} fichier(s) sélectionné(s)
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-slate-300 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
                    Message / Notes
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Informations complémentaires, références, demandes particulières..."
                    rows={4}
                    className="bg-emerald-900/20 border-emerald-800/40 text-white resize-none"
                  />
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 flex-1"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer la demande
                  </Button>
                  {submitted && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="border-emerald-800/40 text-slate-300 hover:text-white hover:bg-emerald-900/20"
                    >
                      Nouvelle demande
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ─── COLONNE LATÉRALE : INFOS ────────────────── */}
        <div className="space-y-6">
          {/* Télécharger le référentiel */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-base">
                <Download className="w-4 h-4" />
                Référentiel PROQUELEC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                Téléchargez le référentiel complet pour connaître toutes les
                exigences techniques et administratives liées à l'obtention du
                label qualité PROQUELEC.
              </p>
              <Button
                variant="outline"
                className="w-full border-emerald-800/40 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 gap-2"
                asChild
              >
                <a
                  href="/documents/referentiel-label-proquelec.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="w-4 h-4" />
                  Télécharger le PDF
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Contact rapide */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-base">
                <Mail className="w-4 h-4" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>proquelec@proquelec.sn</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+221 33 123 45 67</span>
              </div>
              <div className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Dakar, Sénégal</span>
              </div>
              <div className="pt-2">
                <Badge
                  variant="outline"
                  className="border-emerald-800/40 text-emerald-400 bg-emerald-600/10 px-3 py-1"
                >
                  <Info className="w-3 h-3 mr-1" />
                  Réponse sous 48h ouvrées
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Avantages du label */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-base">
                <Award className="w-4 h-4" />
                Avantages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Valorisation de votre travail auprès des clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Conformité garantie à la norme NS 01-001</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Accès aux appels d'offres exigeant la certification</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Assistance technique prioritaire PROQUELEC</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
