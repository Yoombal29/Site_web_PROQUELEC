
import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Clock, Users, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime?: string;
  location: string;
  attendees: number;
  maxAttendees?: number;
  category: 'formation' | 'reunion' | 'intervention' | 'maintenance' | 'autre';
  status: 'planifie' | 'en_cours' | 'termine' | 'annule';
  organizer: string;
  participants: string[];
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Formation sécurité électrique',
    description: 'Formation obligatoire sur les nouvelles normes de sécurité électrique NF C 18-510',
    date: new Date(2024, 5, 20),
    time: '09:00',
    endTime: '17:00',
    location: 'Salle de formation A - PROQUELEC',
    attendees: 15,
    maxAttendees: 20,
    category: 'formation',
    status: 'planifie',
    organizer: 'Jean Dupont',
    participants: []
  },
  {
    id: '2',
    title: 'Maintenance préventive',
    description: 'Contrôle annuel des installations électriques du client ABC Industries',
    date: new Date(2024, 5, 25),
    time: '14:00',
    endTime: '18:00',
    location: 'ABC Industries - Zone industrielle',
    attendees: 3,
    category: 'maintenance',
    status: 'planifie',
    organizer: 'Marie Martin',
    participants: []
  }
];

export function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: new Date(),
    time: '09:00',
    endTime: '10:00',
    location: '',
    maxAttendees: 0,
    category: 'autre',
    organizer: '',
    status: 'planifie'
  });

  const { toast } = useToast();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: number) => {
    return events.filter(event => 
      event.date.getDate() === date &&
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'formation': return 'bg-blue-500 text-white';
      case 'reunion': return 'bg-green-500 text-white';
      case 'intervention': return 'bg-red-500 text-white';
      case 'maintenance': return 'bg-orange-500 text-white';
      case 'autre': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planifie': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-green-100 text-green-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateEvent = () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const newEvent: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: eventForm.title!,
      description: eventForm.description || '',
      date: eventForm.date!,
      time: eventForm.time!,
      endTime: eventForm.endTime,
      location: eventForm.location || '',
      attendees: 0,
      maxAttendees: eventForm.maxAttendees || undefined,
      category: eventForm.category as Event['category'],
      status: eventForm.status as Event['status'],
      organizer: eventForm.organizer || 'Non spécifié',
      participants: []
    };

    setEvents(prev => [...prev, newEvent]);
    setEventForm({
      title: '',
      description: '',
      date: new Date(),
      time: '09:00',
      endTime: '10:00',
      location: '',
      maxAttendees: 0,
      category: 'autre',
      organizer: '',
      status: 'planifie'
    });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Événement créé",
      description: "L'événement a été ajouté au calendrier"
    });
  };

  const handleEditEvent = () => {
    if (!selectedEvent || !eventForm.title) return;

    const updatedEvent: Event = {
      ...selectedEvent,
      ...eventForm as Event
    };

    setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e));
    setSelectedEvent(updatedEvent);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Événement modifié",
      description: "Les modifications ont été enregistrées"
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setSelectedEvent(null);
    
    toast({
      title: "Événement supprimé",
      description: "L'événement a été retiré du calendrier"
    });
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setEventForm(event);
    setIsEditDialogOpen(true);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendrier des événements
            </CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel événement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel événement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={eventForm.title || ''}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre de l'événement"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={eventForm.description || ''}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description détaillée"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={eventForm.date?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: new Date(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Heure début *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={eventForm.time || ''}
                        onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="endTime">Heure fin</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={eventForm.endTime || ''}
                        onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxAttendees">Nb max participants</Label>
                      <Input
                        id="maxAttendees"
                        type="number"
                        value={eventForm.maxAttendees || ''}
                        onChange={(e) => setEventForm(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      value={eventForm.location || ''}
                      onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Lieu de l'événement"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <select title="Sélectionner une option"
                        id="category"
                        value={eventForm.category || 'autre'}
                        onChange={(e) => setEventForm(prev => ({ ...prev, category: e.target.value as Event['category'] }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="formation">Formation</option>
                        <option value="reunion">Réunion</option>
                        <option value="intervention">Intervention</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="organizer">Organisateur</Label>
                      <Input
                        id="organizer"
                        value={eventForm.organizer || ''}
                        onChange={(e) => setEventForm(prev => ({ ...prev, organizer: e.target.value }))}
                        placeholder="Nom de l'organisateur"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button onClick={handleCreateEvent} className="flex-1">
                      Créer l'événement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="h-24 p-1"></div>
              ))}
              
              {Array.from({ length: daysInMonth }, (_, i) => {
                const date = i + 1;
                const dayEvents = getEventsForDate(date);
                
                return (
                  <div key={date} className="h-24 p-1 border rounded hover:bg-muted/50">
                    <div className="text-sm font-medium mb-1">{date}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded cursor-pointer truncate ${getCategoryColor(event.category)}`}
                          onClick={() => setSelectedEvent(event)}
                          title={event.title}
                        >
                          {event.title.substring(0, 12)}...
                        </div>
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

          {selectedEvent && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  {selectedEvent.title}
                  <div className="flex gap-2">
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
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{selectedEvent.description}</p>
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
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {selectedEvent.attendees}
                      {selectedEvent.maxAttendees && `/${selectedEvent.maxAttendees}`} participants
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Organisateur: </span>
                    {selectedEvent.organizer}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Badge className={getCategoryColor(selectedEvent.category)}>
                    {selectedEvent.category}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(selectedEvent.status)}>
                    {selectedEvent.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Titre</Label>
              <Input
                id="edit-title"
                value={eventForm.title || ''}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={eventForm.description || ''}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Statut</Label>
                <select title="Sélectionner une option"
                  id="edit-status"
                  value={eventForm.status || 'planifie'}
                  onChange={(e) => setEventForm(prev => ({ ...prev, status: e.target.value as Event['status'] }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="planifie">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-category">Catégorie</Label>
                <select title="Sélectionner une option"
                  id="edit-category"
                  value={eventForm.category || 'autre'}
                  onChange={(e) => setEventForm(prev => ({ ...prev, category: e.target.value as Event['category'] }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="formation">Formation</option>
                  <option value="reunion">Réunion</option>
                  <option value="intervention">Intervention</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button onClick={handleEditEvent} className="flex-1">
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
