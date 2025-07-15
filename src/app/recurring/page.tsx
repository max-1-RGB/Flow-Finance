
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProfile, ProfileType } from "@/context/ProfileContext";
import { addDays, addWeeks, addMonths, addYears, isAfter, parseISO } from 'date-fns';

type Frequency = "Täglich" | "Wöchentlich" | "Monatlich" | "Quartalsweise" | "Halbjährlich" | "Jährlich";

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  frequency: Frequency;
  startDate: string; // ISO String
  profile: ProfileType;
}

const initialRecurringTransactions: RecurringTransaction[] = [
  { id: "1", description: "Miete", amount: -1200, category: "Wohnen", frequency: "Monatlich", startDate: "2024-01-01", profile: "Privat" },
  { id: "2", description: "Gehalt", amount: 3500, category: "Einkommen", frequency: "Monatlich", startDate: "2024-01-15", profile: "Privat" },
  { id: "3", description: "Netflix", amount: -15.99, category: "Unterhaltung", frequency: "Monatlich", startDate: "2024-01-20", profile: "Privat" },
  { id: "4", description: "AWS Rechnung", amount: -250.50, category: "Hosting", frequency: "Monatlich", startDate: "2024-01-05", profile: "Geschäftlich" },
  { id: "5", description: "DATEV-Gebühren", amount: -89.90, category: "Buchhaltung", frequency: "Jährlich", startDate: "2024-03-01", profile: "Geschäftlich" },
  { id: "6", description: "Versicherungsbeitrag", amount: -150, category: "Versicherungen", frequency: "Quartalsweise", startDate: "2024-01-01", profile: "Privat" },
  { id: "7", description: "GEZ", amount: -55.08, category: "Wohnen", frequency: "Quartalsweise", startDate: "2024-02-15", profile: "Privat" },
];

const calculateNextDueDate = (startDateStr: string, frequency: Frequency): Date => {
    const startDate = parseISO(startDateStr);
    const now = new Date();
    let nextDate = new Date(startDate);
    
    if(isAfter(nextDate, now)) return nextDate;

    while (!isAfter(nextDate, now)) {
        switch (frequency) {
        case 'Täglich':
            nextDate = addDays(nextDate, 1);
            break;
        case 'Wöchentlich':
            nextDate = addWeeks(nextDate, 1);
            break;
        case 'Monatlich':
            nextDate = addMonths(nextDate, 1);
            break;
        case 'Quartalsweise':
            nextDate = addMonths(nextDate, 3);
            break;
        case 'Halbjährlich':
            nextDate = addMonths(nextDate, 6);
            break;
        case 'Jährlich':
            nextDate = addYears(nextDate, 1);
            break;
        }
    }
    return nextDate;
};


export default function RecurringPage() {
  const [transactions, setTransactions] = useState(initialRecurringTransactions);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const { toast } = useToast();
  const { activeProfile } = useProfile();

  const filteredTransactions = useMemo(() => {
    return transactions
        .filter(t => t.profile === activeProfile)
        .map(t => ({ ...t, nextDueDate: calculateNextDueDate(t.startDate, t.frequency) }))
        .sort((a,b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());
  }, [transactions, activeProfile]);

  const monthlyOverview = useMemo(() => {
    let income = 0;
    let expenses = 0;

    const normalizeToMonthly = (amount: number, frequency: Frequency): number => {
      switch (frequency) {
        case 'Täglich': return amount * 30.44;
        case 'Wöchentlich': return amount * (52 / 12);
        case 'Monatlich': return amount;
        case 'Quartalsweise': return amount / 3;
        case 'Halbjährlich': return amount / 6;
        case 'Jährlich': return amount / 12;
        default: return 0;
      }
    };
    
    transactions
      .filter(t => t.profile === activeProfile)
      .forEach(t => {
        const monthlyAmount = normalizeToMonthly(t.amount, t.frequency);
        if (monthlyAmount > 0) {
          income += monthlyAmount;
        } else {
          expenses += monthlyAmount;
        }
    });

    return { income, expenses, net: income + expenses };
  }, [transactions, activeProfile]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const transactionData = {
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
      frequency: formData.get('frequency') as Frequency,
      startDate: formData.get('startDate') as string,
      profile: activeProfile,
    };

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...transactionData } : t));
      toast({ title: "Erfolg", description: "Wiederkehrende Transaktion wurde aktualisiert." });
    } else {
      const newTransaction = { ...transactionData, id: Date.now().toString() };
      setTransactions(prev => [...prev, newTransaction]);
      toast({ title: "Erfolg", description: "Wiederkehrende Transaktion wurde erstellt." });
    }
    
    setDialogOpen(false);
    setEditingTransaction(null);
  };
  
  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({ title: "Erfolg", description: "Wiederkehrende Transaktion wurde gelöscht." });
  };
  
  const openDialog = (transaction: RecurringTransaction | null) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Wiederkehrende Zahlungen ({activeProfile})
        </h1>
        <Button onClick={() => openDialog(null)}><PlusCircle className="mr-2 h-4 w-4" /> Neue erstellen</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktive wiederkehrende Zahlungen</CardTitle>
          <CardDescription>Hier sehen Sie alle regelmäßigen Einnahmen und Ausgaben.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beschreibung</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Frequenz</TableHead>
                <TableHead>Nächste Fälligkeit</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead className="text-center">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.description}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell>{t.frequency}</TableCell>
                    <TableCell>{formatDate(t.nextDueDate)}</TableCell>
                    <TableCell className={`text-right ${t.amount >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" aria-label="Bearbeiten" onClick={() => openDialog(t)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Löschen" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                            <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(t.id)}>Löschen</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">Keine wiederkehrenden Zahlungen gefunden.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) setEditingTransaction(null);
        setDialogOpen(isOpen);
      }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTransaction ? "Zahlung bearbeiten" : "Neue wiederkehrende Zahlung"}</DialogTitle></DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div><Label htmlFor="description">Beschreibung</Label><Input id="description" name="description" defaultValue={editingTransaction?.description} required /></div>
            <div><Label htmlFor="amount">Betrag (€)</Label><Input id="amount" name="amount" type="number" step="0.01" defaultValue={editingTransaction?.amount} placeholder="Negativ für Ausgaben" required /></div>
            <div><Label htmlFor="category">Kategorie</Label><Input id="category" name="category" defaultValue={editingTransaction?.category} required /></div>
            <div>
              <Label htmlFor="frequency">Frequenz</Label>
              <Select name="frequency" defaultValue={editingTransaction?.frequency || "Monatlich"} required>
                <SelectTrigger id="frequency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Täglich">Täglich</SelectItem>
                  <SelectItem value="Wöchentlich">Wöchentlich</SelectItem>
                  <SelectItem value="Monatlich">Monatlich</SelectItem>
                  <SelectItem value="Quartalsweise">Quartalsweise</SelectItem>
                  <SelectItem value="Halbjährlich">Halbjährlich</SelectItem>
                  <SelectItem value="Jährlich">Jährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="startDate">Startdatum</Label><Input id="startDate" name="startDate" type="date" defaultValue={editingTransaction?.startDate || new Date().toISOString().split('T')[0]} required /></div>
            <DialogFooter><Button type="submit">{editingTransaction ? "Speichern" : "Erstellen"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline">Monatliche Übersicht</CardTitle>
          <CardDescription>
            Eine Schätzung Ihrer wiederkehrenden monatlichen Finanzflüsse basierend auf Ihren Eingaben.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
          <div>
            <p className="text-sm text-muted-foreground">Regelmäßige Einnahmen</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyOverview.income)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Regelmäßige Ausgaben</p>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(monthlyOverview.expenses)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Netto-Cashflow</p>
            <p className={`text-2xl font-bold ${monthlyOverview.net >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(monthlyOverview.net)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
