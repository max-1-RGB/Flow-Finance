
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Filter, Receipt, Download, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProfile, ProfileType } from "@/context/ProfileContext";
import { Checkbox } from '@/components/ui/checkbox';
import { parse, isWithinInterval, isValid } from 'date-fns';

interface Receipt {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  profile: ProfileType;
}

const initialReceipts: Receipt[] = [
  { id: "1", date: "2024-07-20", merchant: "Rewe", category: "Lebensmittel", amount: 75.50, profile: "Privat" },
  { id: "2", date: "2024-07-18", merchant: "Tankstelle Shell", category: "Transport", amount: 62.30, profile: "Privat" },
  { id: "3", date: "2024-07-15", merchant: "Office Depot", category: "Bürobedarf", amount: 125.00, profile: "Geschäftlich" },
  { id: "4", date: "2024-07-14", merchant: "Amazon", category: "Software", amount: 59.99, profile: "Geschäftlich" },
  { id: "5", date: "2024-07-21", merchant: "Kino", category: "Unterhaltung", amount: 25.00, profile: "Privat" },
];

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);
  const { toast } = useToast();
  const { activeProfile } = useProfile();

  const handleAddReceipt = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newReceipt: Receipt = {
      id: Date.now().toString(),
      date: formData.get('date') as string,
      merchant: formData.get('merchant') as string,
      category: formData.get('category') as string,
      amount: parseFloat(formData.get('amount') as string),
      profile: activeProfile,
    };
    setReceipts(prev => [newReceipt, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setAddDialogOpen(false);
    toast({ title: "Erfolg", description: "Beleg wurde hinzugefügt." });
    (event.target as HTMLFormElement).reset();
  };
  
  const handleDeleteReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
    toast({ title: "Erfolg", description: "Beleg wurde gelöscht." });
  };

  const filteredReceipts = useMemo(() => {
    const start = startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : null;
    const end = endDate ? parse(endDate, 'yyyy-MM-dd', new Date()) : null;

    return receipts
        .filter(r => r.profile === activeProfile)
        .filter(r => {
            const textMatch = r.merchant.toLowerCase().includes(filter.toLowerCase()) || r.category.toLowerCase().includes(filter.toLowerCase());
            if (!textMatch) return false;

            const receiptDate = parse(r.date, 'yyyy-MM-dd', new Date());
            if (!isValid(receiptDate)) return false;

            const dateInterval = {
              start: start && isValid(start) ? start : new Date(0), // a long time ago
              end: end && isValid(end) ? end : new Date(), // today
            };
            
            // Adjust end date to include the whole day
            if (end && isValid(end)) {
              dateInterval.end.setHours(23, 59, 59, 999);
            }
            
            return isWithinInterval(receiptDate, dateInterval);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [receipts, activeProfile, filter, startDate, endDate]);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReceipts(filteredReceipts.map(r => r.id));
    } else {
      setSelectedReceipts([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedReceipts(prev => [...prev, id]);
    } else {
      setSelectedReceipts(prev => prev.filter(rowId => rowId !== id));
    }
  };
  
  const showNotImplemented = (action: string) => {
      toast({ title: "Funktion nicht verfügbar", description: `Die Aktion "${action}" ist in diesem Prototyp nicht implementiert.`});
  }


  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Quittungen &amp; Belege ({activeProfile})
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Beleg hinzufügen</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Beleg hinzufügen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddReceipt} className="space-y-4">
              <div>
                <Label htmlFor="date">Datum</Label>
                <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <Label htmlFor="merchant">Händler</Label>
                <Input id="merchant" name="merchant" required />
              </div>
              <div>
                <Label htmlFor="amount">Betrag (€)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Input id="category" name="category" required />
              </div>
               <div>
                <Label htmlFor="file">Datei hochladen (simuliert)</Label>
                <Input id="file" name="file" type="file" />
              </div>
              <DialogFooter>
                <Button type="submit">Hinzufügen</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-primary" /> Belege durchsuchen</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-3">
                <Label htmlFor="text-filter">Nach Händler oder Kategorie filtern</Label>
                <Input 
                    id="text-filter"
                    placeholder="z.B. Rewe oder Lebensmittel..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div>
                 <Label htmlFor="start-date">Von Datum</Label>
                 <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
                <Label htmlFor="end-date">Bis Datum</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
             {selectedReceipts.length > 0 && (
                <div className="flex items-end">
                    <Button variant="outline" onClick={() => showNotImplemented("Exportieren")} className="w-full">
                        <Download className="mr-2 h-4 w-4"/> {selectedReceipts.length} Beleg(e) exportieren
                    </Button>
                </div>
             )}
        </CardContent>
       </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Belegübersicht</CardTitle>
          <CardDescription>
            {filteredReceipts.length} Belege für das Profil "{activeProfile}" gefunden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead className="w-[50px]">
                    <Checkbox
                        checked={selectedReceipts.length === filteredReceipts.length && filteredReceipts.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                        aria-label="Alle auswählen"
                    />
                 </TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Händler</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead className="text-center">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id} data-state={selectedReceipts.includes(receipt.id) ? "selected" : ""}>
                    <TableCell>
                        <Checkbox
                            checked={selectedReceipts.includes(receipt.id)}
                            onCheckedChange={(checked) => handleSelectRow(receipt.id, Boolean(checked))}
                            aria-label="Zeile auswählen"
                        />
                    </TableCell>
                    <TableCell>{formatDate(receipt.date)}</TableCell>
                    <TableCell className="font-medium">{receipt.merchant}</TableCell>
                    <TableCell>{receipt.category}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(receipt.amount)}</TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => showNotImplemented("Vorschau")} aria-label="Vorschau">
                          <Eye className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Löschen">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird der Beleg dauerhaft gelöscht.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteReceipt(receipt.id)}>Löschen</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">Keine Belege für dieses Profil und die gewählten Filter gefunden.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    