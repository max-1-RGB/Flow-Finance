
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ListChecks, CircleDollarSign, PlusCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  date: Date;
  title: string;
  type: "Ausgabe" | "Einkommen" | "Erinnerung";
  amount?: number;
}

const initialEvents: CalendarEvent[] = [
  { date: new Date(2024, 6, 20), title: "Netflix Abonnement", type: "Ausgabe", amount: 15.99 },
  { date: new Date(2024, 6, 25), title: "Gehaltseingang", type: "Einkommen", amount: 2500.00 },
  { date: new Date(2024, 6, 28), title: "Mietzahlung", type: "Ausgabe", amount: 1200.00 },
  { date: new Date(2024, 7, 1), title: "Kreditkartenrechnung bezahlen", type: "Erinnerung" },
];

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const eventType = formData.get('type') as CalendarEvent['type'];
    const amount = formData.get('amount') ? parseFloat(formData.get('amount') as string) : undefined;
    
    const newEvent: CalendarEvent = {
      date: new Date(formData.get('date') as string),
      title: formData.get('title') as string,
      type: eventType,
      amount: amount,
    };
    setEvents(prev => [...prev, newEvent]);
    setDialogOpen(false);
    toast({ title: "Erfolg", description: "Ereignis wurde zum Kalender hinzugefügt." });
  };

  const selectedDayEvents = date ? events.filter(event => 
    event.date.getFullYear() === date.getFullYear() &&
    event.date.getMonth() === date.getMonth() &&
    event.date.getDate() === date.getDate()
  ) : [];

  const eventDayMatcher = events.map(event => event.date);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Zahlungskalender
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4"/> Ereignis hinzufügen</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Neues Kalenderereignis</DialogTitle></DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div><Label htmlFor="event-title">Titel</Label><Input id="event-title" name="title" required /></div>
              <div><Label htmlFor="event-date">Datum</Label><Input id="event-date" name="date" type="date" defaultValue={date?.toISOString().split('T')[0]} required /></div>
              <div>
                <Label htmlFor="event-type">Typ</Label>
                <Select name="type" required>
                  <SelectTrigger id="event-type"><SelectValue placeholder="Typ auswählen" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ausgabe">Ausgabe</SelectItem>
                    <SelectItem value="Einkommen">Einkommen</SelectItem>
                    <SelectItem value="Erinnerung">Erinnerung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="event-amount">Betrag (€) (Optional)</Label><Input id="event-amount" name="amount" type="number" step="0.01" /></div>
              <DialogFooter><Button type="submit">Hinzufügen</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
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
                  const isEventDay = events.some(event => 
                    event.date.getFullYear() === dayDate.getFullYear() &&
                    event.date.getMonth() === dayDate.getMonth() &&
                    event.date.getDate() === dayDate.getDate()
                  );
                  if (isEventDay && dayDate.getMonth() === displayMonth.getMonth()) {
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {dayDate.getDate()}
                        <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>
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
            <CardDescription>Ereignisse und Transaktionen für den ausgewählten Tag.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
                  {event.type === "Ausgabe" && <ListChecks className="h-5 w-5 text-destructive" />}
                  {event.type === "Einkommen" && <CircleDollarSign className="h-5 w-5 text-primary" />}
                  {event.type === "Erinnerung" && <ListChecks className="h-5 w-5 text-accent-foreground" />}
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    {event.amount && (
                      <p className={`text-sm ${event.type === "Einkommen" ? "text-primary" : "text-destructive"}`}>
                        {event.type === "Einkommen" ? "+" : "-"}{formatCurrency(event.amount)}
                      </p>
                    )}
                    <Badge variant={event.type === "Ausgabe" ? "destructive" : event.type === "Einkommen" ? "default" : "secondary"} className="capitalize mt-1">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Keine Ereignisse für diesen Tag.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
