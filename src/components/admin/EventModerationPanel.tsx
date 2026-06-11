import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type PendingEvent = {
  id: string;
  title: string;
  date: string;
  location: string | null;
  organizer_type: string | null;
  details: string | null;
  created_at: string;
  organizer_name?: string;
  organizer_email?: string;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

export default function EventModerationPanel() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cms/admin/events/pending', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      const events: PendingEvent[] = Array.isArray(data) ? data : (data.events ?? []);
      setPendingEvents(
        events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les événements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const handleApprove = async (eventId: string) => {
    setActionLoadingId(eventId);
    try {
      const res = await fetch(`/api/cms/admin/events/${eventId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'published' }),
      });
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast({
        title: 'Événement approuvé',
        description: "L'événement a été publié avec succès.",
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : "Impossible d'approuver l'événement",
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (eventId: string) => {
    const reason = window.prompt('Motif du rejet (optionnel) :');
    // User cancelled prompt
    if (reason === null) return;

    setActionLoadingId(eventId);
    try {
      const body: Record<string, string> = { status: 'draft' };
      if (reason?.trim()) {
        body.rejection_reason = reason.trim();
      }
      const res = await fetch(`/api/cms/admin/events/${eventId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast({
        title: 'Événement refusé',
        description: "L'événement a été repassé en brouillon.",
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : "Impossible de refuser l'événement",
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getCategoryBadge = (organizerType: string | null) => {
    if (!organizerType) return null;
    const colors: Record<string, string> = {
      partner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      professional: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      association: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      company: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    };
    return (
      <Badge
        className={
          colors[organizerType] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }
        variant="outline"
      >
        {organizerType}
      </Badge>
    );
  };

  return (
    <Card className="border-amber-200 dark:border-amber-800/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Modération des Événements</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Validez ou refusez les soumissions en attente
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-sm px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-semibold"
        >
          {pendingEvents.length} en attente
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Chargement des événements...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <XCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-base font-medium text-foreground mb-1">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground text-center mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchPendingEvents}>
              Réessayer
            </Button>
          </div>
        )}

        {!loading && !error && pendingEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-base font-medium text-foreground mb-1">Aucun événement en attente</p>
            <p className="text-sm text-muted-foreground text-center">
              Toutes les soumissions ont été traitées.
            </p>
          </div>
        )}

        {!loading && !error && pendingEvents.length > 0 && (
          <div className="divide-y divide-border">
            {pendingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-amber-50/30 dark:hover:bg-amber-900/5 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {event.title}
                    </h3>
                    {getCategoryBadge(event.organizer_type)}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {event.organizer_name && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {event.organizer_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Soumis le {formatDate(event.created_at)}
                    </span>
                    {event.date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(event.date)}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800/40 dark:hover:bg-red-900/20 gap-1.5"
                    onClick={() => handleReject(event.id)}
                    disabled={actionLoadingId === event.id}
                  >
                    {actionLoadingId === event.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Refuser
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-1.5 shadow-sm"
                    onClick={() => handleApprove(event.id)}
                    disabled={actionLoadingId === event.id}
                  >
                    {actionLoadingId === event.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approuver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && pendingEvents.length > 0 && (
          <div className="px-6 py-3 border-t border-border bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">
              {pendingEvents.length} événement{pendingEvents.length > 1 ? 's' : ''} en attente de
              modération
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
