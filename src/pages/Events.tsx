import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Handshake,
  MapPin,
  Monitor,
  Plus,
  ShieldCheck,
} from 'lucide-react';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type EventApiRow = {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  details?: string | null;
  image_url?: string | null;
  status?: string | null;
  organizer_type?: string | null;
};

type EventDetails = {
  description?: string;
  time?: string;
  endTime?: string;
  category?: string;
  type?: string;
  organizer?: string;
  registrationUrl?: string;
  detailsUrl?: string;
};

type DisplayEvent = {
  id: string;
  title: string;
  date: Date;
  location: string;
  description: string;
  time: string;
  category: string;
  type: string;
  organizer: string;
  organizerType: 'proquelec' | 'partner';
  status: string;
  registrationUrl: string;
  detailsUrl: string;
};

type EventsPageContent = {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  official: {
    badge: string;
    title: string;
    subtitle: string;
  };
  partners: {
    badge: string;
    title: string;
    subtitle: string;
    buttonLabel: string;
    buttonHref: string;
  };
  cta: {
    title: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

const DEFAULT_CONTENT: EventsPageContent = {
  hero: {
    badge: 'Calendrier Expert',
    title: 'Événements & Agenda',
    subtitle: "Le carrefour de l'expertise électrique",
    description:
      'Participez aux moments forts du secteur : conférences institutionnelles PROQUELEC, ateliers techniques et initiatives partenaires.',
    primaryLabel: 'Voir les événements officiels',
    primaryHref: '#official',
    secondaryLabel: 'Événements partenaires',
    secondaryHref: '#partners',
  },
  official: {
    badge: 'Institutionnel',
    title: 'Événements PROQUELEC',
    subtitle:
      'Nos rendez-vous officiels pour la promotion de la sécurité et de la qualité électrique au Sénégal.',
  },
  partners: {
    badge: 'Écosystème',
    title: 'Événements Partenaires',
    subtitle:
      "Des initiatives portées par nos partenaires agréés et certifiés, validées par l'expertise PROQUELEC.",
    buttonLabel: 'Devenir Partenaire',
    buttonHref: '/partner',
  },
  cta: {
    title: 'Diffusez votre expertise via le réseau PROQUELEC',
    description:
      "Partenaires, proposez vos ateliers et conférences sur notre plateforme pour toucher l'ensemble des professionnels du secteur.",
    primaryLabel: 'Soumettre un événement',
    primaryHref: '/contact',
    secondaryLabel: 'En savoir plus',
    secondaryHref: '/partenaires',
  },
};

const text = (value: unknown, fallback: string) => {
  const candidate = typeof value === 'string' ? value.trim() : '';
  return candidate || fallback;
};

const parseDetails = (value: string | null | undefined): EventDetails => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === 'object') return parsed as EventDetails;
  } catch {
    return { description: value };
  }
  return {};
};

const formatEventDateParts = (date: Date) => {
  const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(date);
  const month = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date).replace('.', '');
  const year = new Intl.DateTimeFormat('fr-FR', { year: 'numeric' }).format(date);
  return { day, month, year };
};

const normalizeEvent = (row: EventApiRow): DisplayEvent => {
  const details = parseDetails(row.details);
  const date = new Date(row.date);
  const dateLabel = Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
  const timeRange = details.time
    ? `${details.time}${details.endTime ? ` - ${details.endTime}` : ''}`
    : dateLabel;
  const organizerType = row.organizer_type === 'partner' ? 'partner' : 'proquelec';

  return {
    id: row.id,
    title: row.title,
    date,
    location: text(row.location, 'Lieu à confirmer'),
    description: text(details.description, 'Informations complémentaires à venir.'),
    time: timeRange || 'Horaire à confirmer',
    category: text(details.category, organizerType === 'partner' ? 'Partenaire' : 'Institutionnel'),
    type: text(details.type, organizerType === 'partner' ? 'Partenaire' : 'Officiel'),
    organizer: text(
      details.organizer,
      organizerType === 'partner' ? 'Partenaire PROQUELEC' : 'PROQUELEC',
    ),
    organizerType,
    status: text(row.status, 'published'),
    registrationUrl: text(details.registrationUrl, '/contact'),
    detailsUrl: text(details.detailsUrl, `/events#event-${row.id}`),
  };
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
    <CalendarCheck className="mx-auto mb-4 h-10 w-10 text-slate-300" />
    <p className="text-lg font-bold text-slate-800">{label}</p>
    <p className="mt-2 text-sm text-slate-500">
      Les prochains rendez-vous seront affichés automatiquement après publication depuis le
      dashboard.
    </p>
  </div>
);

const EventCard = ({ event }: { event: DisplayEvent }) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const isOfficial = event.organizerType === 'proquelec';
  const dateParts = formatEventDateParts(event.date);

  return (
    <>
      <article
        id={`event-${event.id}`}
        className={`group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl md:flex-row ${
          isOfficial ? 'border-l-8 border-l-blue-600' : 'border-l-8 border-l-indigo-400'
        }`}
      >
        <div
          className={`flex flex-col items-center justify-center p-8 text-center text-white md:w-48 ${
            isOfficial ? 'bg-slate-900' : 'bg-slate-800'
          }`}
        >
          <span className="mb-1 text-sm font-bold uppercase opacity-60">{dateParts.year}</span>
          <span className="mb-1 text-4xl font-black">{dateParts.day}</span>
          <span className="text-lg font-bold text-blue-400">{dateParts.month}</span>
        </div>

        <div className="flex flex-1 flex-col p-8 md:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className={`border-none font-bold hover:bg-opacity-80 ${
                isOfficial ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              {event.category}
            </Badge>
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
                isOfficial ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {isOfficial ? <ShieldCheck className="h-4 w-4" /> : <Handshake className="h-4 w-4" />}
              {isOfficial ? 'Officiel PROQUELEC' : event.organizer}
            </div>
          </div>

          <h3 className="mb-4 text-2xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 md:text-3xl">
            {event.title}
          </h3>
          <p className="mb-8 text-lg leading-relaxed text-slate-600">{event.description}</p>

          <div className="mt-auto grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-slate-500">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">{event.location}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 border-l border-slate-100 bg-slate-50 p-8 md:w-64 md:p-10">
          <Button
            className={`h-12 w-full font-bold shadow-md transition-all ${
              isOfficial ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'
            }`}
            onClick={() => setShowRegistration(true)}
          >
            M'inscrire
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 w-full border-slate-200 font-bold text-slate-600 hover:bg-white"
          >
            <a href={event.detailsUrl}>
              Détails <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </article>
      <RegistrationModal event={event} open={showRegistration} onOpenChange={setShowRegistration} />
    </>
  );
};

type RegistrationForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

type RegistrationModalProps = {
  event: DisplayEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const RegistrationModal = ({ event, open, onOpenChange }: RegistrationModalProps) => {
  const [form, setForm] = useState<RegistrationForm>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir votre nom et votre email.',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`/api/cms/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      setSuccess(true);
      toast({
        title: 'Inscription confirmée 🎉',
        description: `Vous êtes inscrit à : ${event.title}`,
      });
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible de s'inscrire pour le moment.",
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setForm({ name: '', email: '', phone: '', company: '', message: '' });
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetAndClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {success ? '✅ Inscription confirmée' : `Inscription — ${event.title}`}
          </DialogTitle>
        </DialogHeader>
        {success ? (
          <div className="space-y-4 py-4 text-center">
            <p className="text-lg font-semibold text-green-700">Vous êtes bien inscrit !</p>
            <p className="text-muted-foreground">
              Un email de confirmation vous sera envoyé prochainement.
            </p>
            <button onClick={resetAndClose} className="text-sm text-blue-600 underline">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Nom *</Label>
                <Input
                  id="reg-name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email *</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Téléphone</Label>
                <Input
                  id="reg-phone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-company">Entreprise</Label>
                <Input
                  id="reg-company"
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  placeholder="Votre société"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-message">Message (optionnel)</Label>
              <Textarea
                id="reg-message"
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Questions ou remarques..."
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="flex-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Inscription...' : "M'inscrire"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Events = () => {
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const content = DEFAULT_CONTENT;

  useEffect(() => {
    let cancelled = false;

    const loadEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/cms/events');
        if (!response.ok) throw new Error(`API events ${response.status}`);
        const rows = (await response.json()) as EventApiRow[];
        const normalized = rows
          .map(normalizeEvent)
          .filter(
            (event) => !['draft', 'deleted', 'annule', 'pending_review'].includes(event.status),
          )
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        if (!cancelled) setEvents(normalized);
      } catch (err) {
        if (!cancelled) {
          setError("Impossible de charger l'agenda pour le moment.");
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const officialEvents = events.filter((event) => event.organizerType === 'proquelec');
  const partnerEvents = events.filter((event) => event.organizerType === 'partner');

  return (
    <div className="min-h-screen bg-slate-50 font-roboto">
      <SEO title={`${content.hero.title} - PROQUELEC`} description={content.hero.description} />

      <Header />

      <main>
        <HeroSection
          badge={content.hero.badge}
          title={content.hero.title}
          subtitle={content.hero.subtitle}
          description={content.hero.description}
          gradient="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900"
          buttons={[
            {
              label: content.hero.primaryLabel,
              href: content.hero.primaryHref,
              variant: 'primary',
            },
            {
              label: content.hero.secondaryLabel,
              href: content.hero.secondaryHref,
              variant: 'secondary',
            },
          ]}
        />

        <section id="official" className="relative overflow-hidden bg-white px-4 py-24">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 translate-x-24 -skew-x-12 bg-blue-50 opacity-20" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <Badge className="mb-4 border-none bg-blue-600 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-white">
                  {content.official.badge}
                </Badge>
                <h2 className="flex items-center gap-4 text-4xl font-black text-slate-900 md:text-5xl">
                  <CalendarCheck className="h-10 w-10 text-blue-600" />
                  {content.official.title}
                </h2>
                <p className="mt-4 text-xl italic leading-relaxed text-slate-600">
                  {content.official.subtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {loading ? (
                <EmptyState label="Chargement des événements..." />
              ) : error ? (
                <EmptyState label={error} />
              ) : officialEvents.length > 0 ? (
                officialEvents.map((event) => <EventCard key={event.id} event={event} />)
              ) : (
                <EmptyState label="Aucun événement PROQUELEC publié" />
              )}
            </div>
          </div>
        </section>

        <section id="partners" className="bg-slate-50 px-4 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <Badge className="mb-4 border-none bg-indigo-600 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-white">
                  {content.partners.badge}
                </Badge>
                <h2 className="flex items-center gap-4 text-4xl font-black text-slate-900 md:text-5xl">
                  <Handshake className="h-10 w-10 text-indigo-600" />
                  {content.partners.title}
                </h2>
                <p className="mt-4 text-xl leading-relaxed text-slate-600">
                  {content.partners.subtitle}
                </p>
              </div>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-xl border-indigo-200 px-8 font-bold italic text-indigo-600 hover:bg-white"
              >
                <a href={content.partners.buttonHref}>
                  {content.partners.buttonLabel} <Plus className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {loading ? (
                <EmptyState label="Chargement des événements partenaires..." />
              ) : partnerEvents.length > 0 ? (
                partnerEvents.map((event) => <EventCard key={event.id} event={event} />)
              ) : (
                <EmptyState label="Aucun événement partenaire publié" />
              )}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <div className="mx-auto mb-10 flex h-24 w-24 -rotate-6 transform items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md transition-transform duration-500 hover:rotate-0">
              <Monitor className="h-12 w-12 text-blue-400" />
            </div>
            <h2 className="mb-8 text-4xl font-black italic leading-tight md:text-5xl">
              {content.cta.title}
            </h2>
            <p className="mb-12 text-xl leading-relaxed text-slate-400 md:text-2xl">
              {content.cta.description}
            </p>
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-16 rounded-2xl bg-blue-600 px-12 text-lg font-bold text-white shadow-xl shadow-blue-900/40 hover:bg-blue-700"
              >
                <a href={content.cta.primaryHref}>{content.cta.primaryLabel}</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-16 rounded-2xl border-white/20 px-12 text-lg text-white backdrop-blur-sm hover:bg-white/10"
              >
                <a href={content.cta.secondaryHref}>{content.cta.secondaryLabel}</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Retour en haut" />
    </div>
  );
};

export default Events;
