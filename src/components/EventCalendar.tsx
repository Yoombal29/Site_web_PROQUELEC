import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type EventCategory =
  | 'formation'
  | 'reunion'
  | 'intervention'
  | 'maintenance'
  | 'conference'
  | 'partenaire'
  | 'autre';
type EventStatus = 'planifie' | 'en_cours' | 'termine' | 'annule';
type PublicationStatus = 'published' | 'draft' | 'annule' | 'pending_review';
type OrganizerType = 'proquelec' | 'partner';

type ApiEvent = {
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
  category?: EventCategory;
  organizer?: string;
  maxAttendees?: number;
  eventStatus?: EventStatus;
  type?: string;
  registrationUrl?: string;
  detailsUrl?: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  category: EventCategory;
  eventStatus: EventStatus;
  publicationStatus: PublicationStatus;
  organizer: string;
  organizerType: OrganizerType;
  registrationUrl: string;
  detailsUrl: string;
};

type EventForm = {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  endDate: string;
  location: string;
  imageUrl: string;
  maxAttendees: string;
  category: EventCategory;
  eventStatus: EventStatus;
  publicationStatus: PublicationStatus;
  organizer: string;
  organizerType: OrganizerType;
  registrationUrl: string;
  detailsUrl: string;
};

type Comment = {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
};

const emptyForm = (): EventForm => ({
  title: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  time: '09:00',
  endTime: '10:00',
  endDate: '',
  location: '',
  imageUrl: '',
  maxAttendees: '',
  category: 'autre',
  eventStatus: 'planifie',
  publicationStatus: 'published',
  organizer: 'PROQUELEC',
  organizerType: 'proquelec',
  registrationUrl: '/contact',
  detailsUrl: '',
});

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

const toTime = (date: Date) =>
  Number.isNaN(date.getTime())
    ? '09:00'
    : `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const normalizeEvent = (row: ApiEvent): CalendarEvent => {
  const date = new Date(row.date);
  const details = parseDetails(row.details);
  const organizerType: OrganizerType = row.organizer_type === 'partner' ? 'partner' : 'proquelec';
  const publicationStatus: PublicationStatus =
    row.status === 'draft' || row.status === 'annule' || row.status === 'pending_review'
      ? row.status
      : 'published';

  return {
    id: row.id,
    title: row.title,
    description: details.description || '',
    date,
    time: details.time || toTime(date),
    endTime: details.endTime || '',
    location: row.location || '',
    attendees: 0,
    maxAttendees: Number(details.maxAttendees || 0),
    category: details.category || (organizerType === 'partner' ? 'partenaire' : 'conference'),
    eventStatus: details.eventStatus || (publicationStatus === 'annule' ? 'annule' : 'planifie'),
    publicationStatus,
    organizer:
      details.organizer || (organizerType === 'partner' ? 'Partenaire PROQUELEC' : 'PROQUELEC'),
    organizerType,
    registrationUrl:
      details.registrationUrl || (organizerType === 'partner' ? '/partner' : '/contact'),
    detailsUrl: details.detailsUrl || '',
  };
};

const toForm = (event: CalendarEvent): EventForm => ({
  title: event.title,
  description: event.description,
  date: Number.isNaN(event.date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : event.date.toISOString().slice(0, 10),
  time: event.time,
  endTime: event.endTime,
  endDate: '',
  location: event.location,
  imageUrl: '',
  maxAttendees: event.maxAttendees ? String(event.maxAttendees) : '',
  category: event.category,
  eventStatus: event.eventStatus,
  publicationStatus: event.publicationStatus,
  organizer: event.organizer,
  organizerType: event.organizerType,
  registrationUrl:
    event.registrationUrl || (event.organizerType === 'partner' ? '/partner' : '/contact'),
  detailsUrl: event.detailsUrl || '',
});

const buildPayload = (form: EventForm) => {
  const start = new Date(`${form.date}T${form.time || '09:00'}:00`);
  const details: EventDetails = {
    description: form.description,
    time: form.time,
    endTime: form.endTime,
    category: form.category,
    organizer: form.organizer,
    maxAttendees: Number(form.maxAttendees || 0),
    eventStatus: form.eventStatus,
    type: form.organizerType === 'partner' ? 'Partenaire' : 'Officiel',
    registrationUrl: form.registrationUrl || undefined,
    detailsUrl: form.detailsUrl || undefined,
  };

  return {
    title: form.title,
    date: start.toISOString(),
    end_date: form.endDate || undefined,
    location: form.location,
    image_url: form.imageUrl || undefined,
    details: JSON.stringify(details),
    status: form.publicationStatus,
    organizer_type: form.organizerType,
  };
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const categoryLabels: Record<EventCategory, string> = {
  formation: 'Formation',
  reunion: 'Réunion',
  intervention: 'Intervention',
  maintenance: 'Maintenance',
  conference: 'Conférence',
  partenaire: 'Partenaire',
  autre: 'Autre',
};

const statusLabels: Record<EventStatus, string> = {
  planifie: 'Planifié',
  en_cours: 'En cours',
  termine: 'Terminé',
  annule: 'Annulé',
};

const publicationLabels: Record<PublicationStatus, string> = {
  published: 'Publié',
  draft: 'Brouillon',
  annule: 'Annulé',
  pending_review: 'En attente de validation',
};

export function EventCalendar({ role = 'admin' }: { role?: 'admin' | 'partner' }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState<EventForm>(emptyForm);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const { toast } = useToast();

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [events],
  );

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cms/events');
      if (!response.ok) throw new Error(`Chargement impossible (${response.status})`);
      const rows = (await response.json()) as ApiEvent[];
      setEvents(rows.map(normalizeEvent));
    } catch (error) {
      toast({
        title: 'Agenda indisponible',
        description: "Impossible de charger les événements depuis l'API CMS.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
      return next;
    });
  };

  const getEventsForDate = (date: number) =>
    sortedEvents.filter(
      (event) =>
        event.date.getDate() === date &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear(),
    );

  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case 'formation':
        return 'bg-blue-500 text-white';
      case 'reunion':
        return 'bg-green-500 text-white';
      case 'intervention':
        return 'bg-red-500 text-white';
      case 'maintenance':
        return 'bg-orange-500 text-white';
      case 'conference':
        return 'bg-indigo-500 text-white';
      case 'partenaire':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'planifie':
        return 'bg-blue-100 text-blue-800';
      case 'en_cours':
        return 'bg-green-100 text-green-800';
      case 'termine':
        return 'bg-gray-100 text-gray-800';
      case 'annule':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const resetCreateForm = () => {
    const form = emptyForm();
    // Si le rôle est partenaire, forcer les valeurs appropriées
    if (role === 'partner') {
      form.organizerType = 'partner';
      form.publicationStatus = 'pending_review';
      form.organizer = '';
    }
    setEventForm(form);
    setIsCreateDialogOpen(true);
  };

  const saveEvent = async (mode: 'create' | 'edit') => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir le titre, la date et l’heure de début.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Partenaire : forcer le statut et le type
      const payload = buildPayload(eventForm);
      if (role === 'partner') {
        payload.organizer_type = 'partner';
        payload.status = 'pending_review';
      }
      const response = await fetch(
        mode === 'edit' && selectedEvent
          ? `/api/cms/events/${selectedEvent.id}`
          : '/api/cms/events',
        {
          method: mode === 'edit' ? 'PUT' : 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error(`Sauvegarde impossible (${response.status})`);
      const saved = normalizeEvent((await response.json()) as ApiEvent);
      setEvents((prev) =>
        mode === 'edit'
          ? prev.map((event) => (event.id === saved.id ? saved : event))
          : [...prev, saved],
      );
      setSelectedEvent(saved);
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      toast({
        title: mode === 'edit' ? 'Événement modifié' : 'Événement créé',
        description: 'La page publique /events utilisera cette donnée automatiquement.',
      });
    } catch (error) {
      toast({
        title: 'Sauvegarde impossible',
        description: 'Vérifiez votre session admin puis réessayez.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const loadComments = async (eventId: string) => {
    try {
      const res = await fetch(`/api/cms/events/${eventId}/comments`, { headers: getAuthHeaders() });
      if (res.ok) setComments(await res.json());
    } catch {
      // Le chargement des commentaires n'est pas bloquant
    }
  };

  const handleSendComment = async () => {
    if (!commentInput.trim() || !selectedEvent) return;
    try {
      const res = await fetch(`/api/cms/events/${selectedEvent.id}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: commentInput.trim() }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setCommentInput('');
      }
    } catch {
      // L'envoi du commentaire n'est pas bloquant
    }
  };

  // Load comments when selected event changes
  useEffect(() => {
    if (selectedEvent) loadComments(selectedEvent.id);
  }, [selectedEvent?.id]);

  const deleteEvent = async (eventId: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/cms/events/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`Suppression impossible (${response.status})`);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setSelectedEvent(null);
      toast({
        title: 'Événement supprimé',
        description: "L'événement a été retiré de l'agenda.",
      });
    } catch (error) {
      toast({
        title: 'Suppression impossible',
        description: 'Vérifiez votre session admin puis réessayez.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventForm(toForm(event));
    setIsEditDialogOpen(true);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const formFields = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="event-title">Titre *</Label>
        <Input
          id="event-title"
          value={eventForm.title}
          onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="Titre de l'événement"
        />
      </div>

      <div>
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          value={eventForm.description}
          onChange={(event) =>
            setEventForm((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="Description détaillée"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event-date">Date *</Label>
          <Input
            id="event-date"
            type="date"
            value={eventForm.date}
            onChange={(event) => setEventForm((prev) => ({ ...prev, date: event.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="event-end-date">Date de fin (optionnel)</Label>
          <Input
            id="event-end-date"
            type="date"
            value={eventForm.endDate}
            onChange={(e) => setEventForm((prev) => ({ ...prev, endDate: e.target.value }))}
          />
          <p className="mt-1 text-xs text-muted-foreground">Pour les événements multi-jours</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event-time">Heure début *</Label>
          <Input
            id="event-time"
            type="time"
            value={eventForm.time}
            onChange={(event) => setEventForm((prev) => ({ ...prev, time: event.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="event-end-time">Heure fin</Label>
          <Input
            id="event-end-time"
            type="time"
            value={eventForm.endTime}
            onChange={(event) => setEventForm((prev) => ({ ...prev, endTime: event.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event-max">Nb max participants</Label>
          <Input
            id="event-max"
            type="number"
            min={0}
            value={eventForm.maxAttendees}
            onChange={(event) =>
              setEventForm((prev) => ({ ...prev, maxAttendees: event.target.value }))
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="event-location">Lieu</Label>
        <Input
          id="event-location"
          value={eventForm.location}
          onChange={(event) => setEventForm((prev) => ({ ...prev, location: event.target.value }))}
          placeholder="Lieu de l'événement"
        />
      </div>

      <div>
        <Label htmlFor="event-image">Image à la une (URL)</Label>
        <Input
          id="event-image"
          value={eventForm.imageUrl}
          onChange={(e) => setEventForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
          placeholder="https://images.unsplash.com/..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event-category">Catégorie</Label>
          <select
            id="event-category"
            value={eventForm.category}
            onChange={(event) =>
              setEventForm((prev) => ({ ...prev, category: event.target.value as EventCategory }))
            }
            className="w-full rounded-md border p-2"
          >
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="event-organizer-type">Type</Label>
          <select
            id="event-organizer-type"
            value={eventForm.organizerType}
            onChange={(event) =>
              setEventForm((prev) => ({
                ...prev,
                organizerType: event.target.value as OrganizerType,
                organizer: event.target.value === 'partner' ? prev.organizer : 'PROQUELEC',
              }))
            }
            className="w-full rounded-md border p-2"
            disabled={role === 'partner'}
          >
            <option value="proquelec">PROQUELEC</option>
            <option value="partner">Partenaire</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event-status">Statut événement</Label>
          <select
            id="event-status"
            value={eventForm.eventStatus}
            onChange={(event) =>
              setEventForm((prev) => ({ ...prev, eventStatus: event.target.value as EventStatus }))
            }
            className="w-full rounded-md border p-2"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="event-publication">Publication</Label>
          <select
            id="event-publication"
            value={eventForm.publicationStatus}
            onChange={(event) =>
              setEventForm((prev) => ({
                ...prev,
                publicationStatus: event.target.value as PublicationStatus,
              }))
            }
            className="w-full rounded-md border p-2"
            disabled={role === 'partner'}
          >
            {Object.entries(publicationLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="event-organizer">Organisateur</Label>
        <Input
          id="event-organizer"
          value={eventForm.organizer}
          onChange={(event) => setEventForm((prev) => ({ ...prev, organizer: event.target.value }))}
          placeholder="PROQUELEC ou partenaire"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event-registration">Lien d'inscription</Label>
          <Input
            id="event-registration"
            value={eventForm.registrationUrl}
            onChange={(event) =>
              setEventForm((prev) => ({ ...prev, registrationUrl: event.target.value }))
            }
            placeholder="/contact"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lien du bouton "M'inscrire" — page contact, formulaire externe, etc.
          </p>
        </div>
        <div>
          <Label htmlFor="event-details">Lien détails</Label>
          <Input
            id="event-details"
            value={eventForm.detailsUrl}
            onChange={(event) =>
              setEventForm((prev) => ({ ...prev, detailsUrl: event.target.value }))
            }
            placeholder="/events#event-..."
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lien du bouton "Détails" — laisse vide pour un ancrage automatique
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendrier des événements
            </CardTitle>
            <Button onClick={resetCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel événement
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <div className="mb-4 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }, (_, index) => (
                <div key={`empty-${index}`} className="h-24 p-1" />
              ))}

              {Array.from({ length: daysInMonth }, (_, index) => {
                const date = index + 1;
                const dayEvents = getEventsForDate(date);

                return (
                  <div key={date} className="h-24 rounded border p-1 hover:bg-muted/50">
                    <div className="mb-1 text-sm font-medium">{date}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          className={`w-full truncate rounded p-1 text-left text-xs ${getCategoryColor(event.category)}`}
                          onClick={() => setSelectedEvent(event)}
                          title={event.title}
                        >
                          {event.title}
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {loading && <p className="text-sm text-muted-foreground">Chargement des événements...</p>}

          {selectedEvent && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  {selectedEvent.title}
                  <div className="flex gap-2">
                    {role === 'admin' && selectedEvent.publicationStatus === 'pending_review' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={saving}
                          onClick={async () => {
                            setSaving(true);
                            try {
                              const res = await fetch(`/api/cms/events/${selectedEvent.id}`, {
                                method: 'PUT',
                                headers: getAuthHeaders(),
                                body: JSON.stringify({ status: 'published', review_comment: '' }),
                              });
                              if (!res.ok) throw new Error();
                              const updated = normalizeEvent((await res.json()) as ApiEvent);
                              setEvents((prev) =>
                                prev.map((e) => (e.id === updated.id ? updated : e)),
                              );
                              setSelectedEvent(updated);
                              toast({
                                title: '✅ Événement approuvé',
                                description: 'Il est maintenant visible sur le calendrier public.',
                              });
                            } catch {
                              toast({
                                title: 'Erreur',
                                description: 'Impossible de valider.',
                                variant: 'destructive',
                              });
                            } finally {
                              setSaving(false);
                            }
                          }}
                        >
                          ✓ Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={saving}
                          onClick={async () => {
                            const comment = window.prompt('Motif du refus (optionnel) :');
                            if (comment === null) return;
                            setSaving(true);
                            try {
                              const res = await fetch(`/api/cms/events/${selectedEvent.id}`, {
                                method: 'PUT',
                                headers: getAuthHeaders(),
                                body: JSON.stringify({
                                  status: 'draft',
                                  review_comment: comment || '',
                                }),
                              });
                              if (!res.ok) throw new Error();
                              const updated = normalizeEvent((await res.json()) as ApiEvent);
                              setEvents((prev) =>
                                prev.map((e) => (e.id === updated.id ? updated : e)),
                              );
                              setSelectedEvent(updated);
                              toast({
                                title: '❌ Événement refusé',
                                description: comment || 'Aucun motif fourni.',
                              });
                            } catch {
                              toast({
                                title: 'Erreur',
                                description: 'Impossible de refuser.',
                                variant: 'destructive',
                              });
                            } finally {
                              setSaving(false);
                            }
                          }}
                        >
                          ✕ Refuser
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(selectedEvent)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={saving}
                      onClick={() => deleteEvent(selectedEvent.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">{selectedEvent.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {selectedEvent.time}
                      {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.location || 'Lieu à confirmer'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {selectedEvent.attendees}
                      {selectedEvent.maxAttendees ? `/${selectedEvent.maxAttendees}` : ''}{' '}
                      participants
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Organisateur: </span>
                    {selectedEvent.organizer}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(selectedEvent.category)}>
                    {categoryLabels[selectedEvent.category]}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(selectedEvent.eventStatus)}>
                    {statusLabels[selectedEvent.eventStatus]}
                  </Badge>
                  <Badge variant="outline">
                    {publicationLabels[selectedEvent.publicationStatus]}
                  </Badge>
                </div>

                {/* Commentaires (Admin ↔ Partenaire) */}
                {selectedEvent.id && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="mb-3 text-sm font-bold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Commentaires
                    </h4>
                    <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
                      {comments.length === 0 && (
                        <p className="text-xs text-muted-foreground">Aucun commentaire</p>
                      )}
                      {comments.map((c) => (
                        <div key={c.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs">{c.user_name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700">{c.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        className="text-sm h-9"
                        placeholder="Écrire un commentaire..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendComment();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-9"
                        onClick={handleSendComment}
                        disabled={!commentInput.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer un nouvel événement</DialogTitle>
          </DialogHeader>
          {formFields}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button onClick={() => saveEvent('create')} disabled={saving} className="flex-1">
              Créer l'événement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
          </DialogHeader>
          {formFields}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={() => saveEvent('edit')} disabled={saving} className="flex-1">
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
