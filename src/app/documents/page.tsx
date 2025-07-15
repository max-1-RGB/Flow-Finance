
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, FileArchive, Eye, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { differenceInDays, parseISO } from 'date-fns';

type DocumentType = "Lizenz" | "Versicherung" | "Zertifikat" | "Vertrag" | "Sonstiges";

interface DocumentItem {
  id: string;
  name: string;
  type: DocumentType;
  uploadDate: string;
  expiryDate?: string;
  fileUrl?: string; // Simulated file URL
}

const initialDocuments: DocumentItem[] = [
  { id: "1", name: "Drohnenführerschein A1/A3", type: "Lizenz", uploadDate: "2023-05-20", expiryDate: "2028-05-19" },
  { id: "2", name: "Drohnen-Haftpflichtversicherung", type: "Versicherung", uploadDate: "2024-01-10", expiryDate: "2025-01-09" },
  { id: "3", name: "Gewerbeanmeldung", type: "Sonstiges", uploadDate: "2022-03-15" },
  { id: "4", name: "Rahmenvertrag mit Kunde A", type: "Vertrag", uploadDate: "2023-09-01", expiryDate: "2024-08-31"},
];

const getStatus = (expiryDate?: string): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (!expiryDate) return { text: 'Gültig', variant: 'default' };
    const daysLeft = differenceInDays(parseISO(expiryDate), new Date());
    if (daysLeft < 0) return { text: 'Abgelaufen', variant: 'destructive' };
    if (daysLeft <= 30) return { text: `Läuft in ${daysLeft} Tagen ab`, variant: 'outline' };
    return { text: 'Gültig', variant: 'default' };
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const itemData: Omit<DocumentItem, 'id'> = {
      name: formData.get('name') as string,
      type: formData.get('type') as DocumentType,
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: formData.get('expiryDate') as string || undefined,
    };

    if (editingItem) {
      setDocuments(documents.map(d => d.id === editingItem.id ? { ...editingItem, ...itemData } : d));
      toast({ title: "Dokument aktualisiert" });
    } else {
      setDocuments([...documents, { ...itemData, id: Date.now().toString() }]);
      toast({ title: "Neues Dokument hinzugefügt" });
    }

    setDialogOpen(false);
    setEditingItem(null);
  };

  const openDialog = (item: DocumentItem | null) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast({ title: "Dokument gelöscht" });
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const showNotImplemented = (action: string) => {
      toast({ title: "Funktion nicht verfügbar", description: `Die Aktion "${action}" ist in diesem Prototyp nicht implementiert.`});
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Dokumentenverwaltung
        </h1>
        <Button onClick={() => openDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Neues Dokument hinzufügen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileArchive className="h-5 w-5 text-primary" /> Ihre Dokumente</CardTitle>
          <CardDescription>Verwalten Sie wichtige Lizenzen, Versicherungen und andere Unterlagen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Ablaufdatum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? documents.map((item) => {
                const status = getStatus(item.expiryDate);
                return (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{formatDate(item.expiryDate || "")}</TableCell>
                        <TableCell><Badge variant={status.variant}>{status.text}</Badge></TableCell>
                        <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => showNotImplemented("Vorschau")}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => showNotImplemented("Download")}><Download className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Edit className="h-4 w-4" /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                                    <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id)}>Löschen</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                )
              }) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Noch keine Dokumente hinzugefügt.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) setEditingItem(null);
        setDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Dokument bearbeiten' : 'Neues Dokument hinzufügen'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dokumentenname</Label>
              <Input id="name" name="name" defaultValue={editingItem?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Dokumententyp</Label>
               <Select name="type" defaultValue={editingItem?.type || "Lizenz"} required>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lizenz">Lizenz</SelectItem>
                    <SelectItem value="Versicherung">Versicherung</SelectItem>
                    <SelectItem value="Zertifikat">Zertifikat</SelectItem>
                    <SelectItem value="Vertrag">Vertrag</SelectItem>
                    <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="file">Datei hochladen (simuliert)</Label>
              <Input id="file" name="file" type="file" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Ablaufdatum (optional)</Label>
              <Input id="expiryDate" name="expiryDate" type="date" defaultValue={editingItem?.expiryDate} />
            </div>
            <DialogFooter>
              <Button type="submit">{editingItem ? 'Speichern' : 'Hinzufügen'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
