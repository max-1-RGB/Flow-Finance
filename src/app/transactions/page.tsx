
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, Filter, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useProfile, ProfileType } from "@/context/ProfileContext";
import { automaticCategorization } from '@/ai/flows/automatic-categorization';
import { useAuditTrail } from '@/context/AuditTrailContext';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "Einkommen" | "Ausgabe";
  profile: ProfileType;
}

const initialTransactions: Transaction[] = [
  { id: "1", date: "2024-07-15", description: "Lebensmitteleinkauf bei Rewe", category: "Lebensmittel", amount: -75.50, type: "Ausgabe", profile: "Privat" },
  { id: "2", date: "2024-07-14", description: "Gehalt Juli", category: "Einkommen", amount: 2500.00, type: "Einkommen", profile: "Privat" },
  { id: "3", date: "2024-07-13", description: "Netflix Abonnement", category: "Unterhaltung", amount: -15.99, type: "Ausgabe", profile: "Privat" },
  { id: "4", date: "2024-07-12", description: "Tanken bei Shell", category: "Transport", amount: -45.00, type: "Ausgabe", profile: "Privat" },
  { id: "5", date: "2024-07-15", description: "Büromaterial von Office Depot", category: "Bürobedarf", amount: -125.00, type: "Ausgabe", profile: "Geschäftlich" },
  { id: "6", date: "2024-07-14", description: "Kundenzahlung Projekt X", category: "Umsatz", amount: 5000.00, type: "Einkommen", profile: "Geschäftlich" },
  { id: "7", date: "2024-07-13", description: "Software-Abo (Adobe Creative Cloud)", category: "Software", amount: -59.99, type: "Ausgabe", profile: "Geschäftlich" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { activeProfile } = useProfile();
  const { addAuditLog } = useAuditTrail();

  // State for the new transaction dialog
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isCategorizing, setIsCategorizing] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setAddDialogOpen(true);
    }
  }, [searchParams]);

  const resetDialogState = () => {
    setDescription('');
    setCategory('');
    setIsCategorizing(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      resetDialogState();
    }
  };

  const handleDescriptionBlur = useCallback(async () => {
    if (description.trim().length < 3) return;
    
    setIsCategorizing(true);
    try {
      const userCategories = [...new Set(transactions.map(t => t.category))];
      const result = await automaticCategorization({
        text: description,
        merchant: '', // Could be extracted in a more advanced version
        amount: 0, // Not needed for simple categorization
        time: new Date().toISOString(),
        userCategories: userCategories
      });

      if (result && result.category) {
        setCategory(result.category);
      }
    } catch (error) {
      console.error("Fehler bei der automatischen Kategorisierung:", error);
      // Don't show a toast here to not annoy the user
    } finally {
      setIsCategorizing(false);
    }
  }, [description, transactions]);

  const handleAddTransaction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: formData.get('date') as string,
      description: description,
      category: formData.get('category') as string,
      amount: amount,
      type: amount >= 0 ? "Einkommen" : "Ausgabe",
      profile: activeProfile,
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    addAuditLog({
      action: `Neue Transaktion gebucht (${newTransaction.type})`,
      details: `${description}: ${formatCurrency(amount)}`
    });
    handleOpenChange(false);
    toast({ title: "Erfolg", description: "Transaktion wurde hinzugefügt." });
  };
  
  const handleDeleteTransaction = (transaction: Transaction) => {
    setTransactions(prev => prev.filter(t => t.id !== transaction.id));
    addAuditLog({
        action: "Transaktion gelöscht",
        details: `${transaction.description}: ${formatCurrency(transaction.amount)} (ID: ${transaction.id})`
    });
    toast({ title: "Erfolg", description: "Transaktion wurde gelöscht." });
  };
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.profile === activeProfile).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeProfile]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const showNotImplementedToast = () => {
    toast({
      title: "Noch nicht implementiert",
      description: "Diese Funktion ist in Kürze verfügbar.",
      variant: "default",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Einnahmen &amp; Ausgaben ({activeProfile})
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={showNotImplementedToast}><Upload className="mr-2 h-4 w-4" /> Importieren</Button>
          <Dialog open={isAddDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Transaktion hinzufügen</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Transaktion hinzufügen</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <Label htmlFor="date">Datum</Label>
                  <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]}/>
                </div>
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Input 
                    id="description" 
                    name="description" 
                    required 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    onBlur={handleDescriptionBlur}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Betrag (€)</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" placeholder="z.B. -50 für Ausgaben" required />
                </div>
                <div className="relative">
                  <Label htmlFor="category">Kategorie</Label>
                  <Input 
                    id="category" 
                    name="category" 
                    required 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder={isCategorizing ? "Analysiere..." : "Wird automatisch vorgeschlagen"}
                  />
                  {isCategorizing && <Loader2 className="absolute right-2 top-8 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                <DialogFooter>
                  <Button type="submit">Hinzufügen</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaktionen filtern</CardTitle>
          <CardDescription>Verfeinern Sie Ihre Ansicht der Transaktionen nach bestimmten Kriterien.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Input placeholder="Nach Beschreibung suchen..." />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Nach Kategorie filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">Lebensmittel</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="entertainment">Unterhaltung</SelectItem>
              <SelectItem value="income">Einkommen</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Nach Typ filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Einkommen</SelectItem>
              <SelectItem value="expense">Ausgabe</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto" onClick={showNotImplementedToast}><Filter className="mr-2 h-4 w-4" /> Filter anwenden</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaktionsverlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead className="text-center">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${transaction.amount > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird die Transaktion dauerhaft gelöscht.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTransaction(transaction)}>Löschen</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
