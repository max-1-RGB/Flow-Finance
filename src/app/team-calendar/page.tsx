
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Briefcase, Plane, User, CalendarClock, Edit, Trash2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';

type EventType = "Reise" | "Urlaub" | "Termin" | "Deadline";

interface TeamCalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: EventType;
  description?: string;
  participants?: string[];
}

const initialEvents: TeamCalendarEvent[] = [
  { id: '1', date: new Date(2024, 7, 5), title: "Reise nach Berlin (Videodreh)", type: "Reise", participants: ["Anna Schmidt"] },
  { id: '2', date: new Date(2024, 7, 10), title: "Deadline: Videoschnitt Projekt X", type: "Deadline" },
  { id: '3', date: new Date(2024, 7, 15), title: "Team-Meeting: Quartalsplanung", type: "Termin", participants: ["Anna Schmidt", "Ben Weber", "Max Mustermann"] },
  { id: '4', date: new Date(2024, 8, 2), title: "Urlaub Max Mustermann", type: "Urlaub", participants: ["Max Mustermann"] },
];

const eventIcons: Record<EventType, React.ElementType> = {
  Reise: Plane,
  Urlaub: Briefcase,
  Termin: User,
  Deadline: CalendarClock,
};

const eventColors: Record<EventType, "default" | "secondary" | "destructive" | "outline"> = {
  Reise: "destructive",
  Urlaub: "secondary",
  Termin: "default",
  Deadline: "outline",
};

export default function TeamCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<TeamCalendarEvent[]>(initialEvents);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TeamCalendarEvent | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const eventData = {
      date: new Date(formData.get('date') as string),
      title: formData.get('title') as string,
      type: formData.get('type') as EventType,
      description: formData.get('description') as string,
      participants: (formData.get('participants') as string).split(',').map(p => p.trim()).filter(Boolean),
    };
    
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e));
      toast({ title: "Erfolg", description: "Das Ereignis wurde aktualisiert." });
    } else {
      const newEvent: TeamCalendarEvent = { ...eventData, id: Date.now().toString() };
      setEvents(prev => [...prev, newEvent]);
      toast({ title: "Erfolg", description: "Neues Ereignis wurde zum Kalender hinzugefügt." });
    }
    
    setDialogOpen(false);
    setEditingEvent(null);
  };

  const openDialog = (event: TeamCalendarEvent | null = null) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    toast({ title: "Ereignis gelöscht" });
  };

  const selectedDayEvents = date ? events.filter(event => 
    event.date.getFullYear() === date.getFullYear() &&
    event.date.getMonth() === date.getMonth() &&
    event.date.getDate() === date.getDate()
  ) : [];

  const eventDayMatcher = events.map(event => event.date);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Team-Kalender
        </h1>
        <Button onClick={() => openDialog()}><PlusCircle className="mr-2 h-4 w-4"/> Ereignis eintragen</Button>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setEditingEvent(null);
          setDialogOpen(isOpen);
      }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingEvent ? "Ereignis bearbeiten" : "Neues Team-Ereignis"}</DialogTitle></DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div><Label htmlFor="event-title">Titel</Label><Input id="event-title" name="title" defaultValue={editingEvent?.title} required /></div>
            <div><Label htmlFor="event-date">Datum</Label><Input id="event-date" name="date" type="date" defaultValue={editingEvent?.date.toISOString().split('T')[0] || date?.toISOString().split('T')[0]} required /></div>
            <div>
              <Label htmlFor="event-type">Typ</Label>
              <Select name="type" defaultValue={editingEvent?.type} required>
                <SelectTrigger id="event-type"><SelectValue placeholder="Typ auswählen" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(eventIcons).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="event-participants">Teilnehmer (kommagetrennt)</Label><Input id="event-participants" name="participants" defaultValue={editingEvent?.participants?.join(', ')} placeholder="z.B. Anna Schmidt, Ben Weber"/></div>
            <div><Label htmlFor="event-description">Beschreibung</Label><Textarea id="event-description" name="description" defaultValue={editingEvent?.description} /></div>
            <DialogFooter><Button type="submit">{editingEvent ? "Änderungen speichern" : "Hinzufügen"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md w-full p-4"
              locale={require('date-fns/locale/de').default}
              modifiers={{ eventDays: eventDayMatcher }}
              modifiersStyles={{ eventDays: { fontWeight: 'bold', color: 'hsl(var(--primary))' } }}
              components={{
                DayContent: ({ date: dayDate, displayMonth }) => {
                  const dayEvents = events.filter(event => 
                    event.date.getFullYear() === dayDate.getFullYear() &&
                    event.date.getMonth() === dayDate.getMonth() &&
                    event.date.getDate() === dayDate.getDate()
                  );
                  if (dayEvents.length > 0 && dayDate.getMonth() === displayMonth.getMonth()) {
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {dayDate.getDate()}
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {dayEvents.slice(0, 3).map((event, i) => {
                                const Icon = eventIcons[event.type];
                                return <Icon key={i} className="w-1.5 h-1.5" style={{ color: `hsl(var(--${eventColors[event.type] === 'default' ? 'primary' : 'secondary'}))`}}/>
                            })}
                        </div>
                      </div>
                    );
                  }
                  return dayDate.getDate();
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">
              {date ? date.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Datum auswählen"}
            </CardTitle>
            <CardDescription>Ereignisse für den ausgewählten Tag.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => {
                const Icon = eventIcons[event.type];
                return (
                    <div key={event.id} className="group relative flex items-start gap-3 p-3 rounded-md border bg-muted/30">
                        <div className="absolute top-1 right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openDialog(event)}><Edit className="h-4 w-4" /></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                                        <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(event.id)}>Löschen</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <Icon className="h-5 w-5 mt-1 text-primary" />
                        <div>
                            <p className="font-semibold">{event.title}</p>
                            <Badge variant={eventColors[event.type]} className="capitalize my-1">
                                {event.type}
                            </Badge>
                            {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                            {event.participants && event.participants.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs font-semibold">Teilnehmer:</p>
                                    <p className="text-xs text-muted-foreground">{event.participants.join(', ')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">Keine Ereignisse für diesen Tag.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
