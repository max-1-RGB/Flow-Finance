
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Download, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useProfile, ProfileType } from "@/context/ProfileContext";
import { useAuditTrail } from '@/context/AuditTrailContext';

type InvoiceStatus = "Bezahlt" | "Ausstehend" | "Überfällig" | "Entwurf";

interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  profile: ProfileType;
}

const initialInvoices: Invoice[] = [
  { id: "INV001", client: "Acme Corp", amount: 1200.00, dueDate: "2024-08-01", status: "Bezahlt", profile: "Geschäftlich" },
  { id: "INV002", client: "Beta LLC", amount: 850.50, dueDate: "2024-07-25", status: "Ausstehend", profile: "Geschäftlich" },
  { id: "INV003", client: "Gamma Inc", amount: 2300.75, dueDate: "2024-07-10", status: "Überfällig", profile: "Geschäftlich" },
  { id: "INV004", client: "Mieter A", amount: 800.00, dueDate: "2024-08-15", status: "Bezahlt", profile: "Privat" },
];

const statusOptions: InvoiceStatus[] = ["Entwurf", "Ausstehend", "Bezahlt", "Überfällig"];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("alle");
  const { toast } = useToast();
  const { activeProfile } = useProfile();
  const { addAuditLog } = useAuditTrail();

  const handleCreateInvoice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newInvoice: Invoice = {
      id: `INV${(invoices.length + 1).toString().padStart(3, '0')}`,
      client: formData.get('client') as string,
      amount: parseFloat(formData.get('amount') as string),
      dueDate: formData.get('dueDate') as string,
      status: "Entwurf",
      profile: activeProfile,
    };
    setInvoices(prev => [newInvoice, ...prev].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
    setCreateDialogOpen(false);
    toast({ title: "Erfolg", description: "Rechnung wurde als Entwurf gespeichert." });
    (event.target as HTMLFormElement).reset();
  };
  
  const handleStatusChange = (id: string, newStatus: InvoiceStatus) => {
    let oldStatus = '';
    setInvoices(prev => prev.map(inv => {
        if (inv.id === id) {
            oldStatus = inv.status;
            return { ...inv, status: newStatus };
        }
        return inv;
    }));
    addAuditLog({
        action: "Rechnungsstatus geändert",
        details: `Rechnung ${id} von "${oldStatus}" zu "${newStatus}"`
    });
    toast({ title: "Status aktualisiert", description: `Der Status für Rechnung ${id} wurde auf "${newStatus}" geändert.` });
  };


  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download gestartet",
      description: `Rechnung ${invoiceId} wird heruntergeladen.`,
    });
  };

  const handleSendReminder = (invoice: Invoice) => {
    toast({
      title: "Erinnerung gesendet",
      description: `Eine Zahlungserinnerung wurde an ${invoice.client} für Rechnung ${invoice.id} gesendet.`,
    });
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      if (invoice.profile !== activeProfile) return false;

      const matchesSearchTerm = 
        invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        statusFilter === 'alle' || invoice.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearchTerm && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter, activeProfile]);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Bezahlt": return "default";
      case "Ausstehend": return "secondary";
      case "Überfällig": return "destructive";
      case "Entwurf": return "outline";
      default: return "outline";
    }
  };

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
          Rechnungsverwaltung ({activeProfile})
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Neue Rechnung erstellen</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Neue Rechnung erstellen</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div><Label htmlFor="client">Kunde</Label><Input id="client" name="client" required /></div>
              <div><Label htmlFor="amount">Betrag (€)</Label><Input id="amount" name="amount" type="number" step="0.01" required /></div>
              <div><Label htmlFor="dueDate">Fälligkeitsdatum</Label><Input id="dueDate" name="dueDate" type="date" required /></div>
              <DialogFooter><Button type="submit">Rechnung erstellen</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rechnungen filtern</CardTitle>
          <CardDescription>Verfeinern Sie Ihre Ansicht der Rechnungen.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            placeholder="Nach Kunde oder Rechnungs-ID suchen..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Nach Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Status</SelectItem>
              {statusOptions.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alle Rechnungen</CardTitle>
          <CardDescription>
            {filteredInvoices.length} von {invoices.filter(i => i.profile === activeProfile).length} Rechnungen werden angezeigt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rechnungs-ID</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Fälligkeitsdatum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>
                      <Select value={invoice.status} onValueChange={(value) => handleStatusChange(invoice.id, value as InvoiceStatus)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs focus:ring-0 focus:ring-offset-0 border-none shadow-none bg-transparent">
                          <SelectValue asChild>
                             <Badge variant={getStatusVariant(invoice.status)} className="capitalize cursor-pointer">{invoice.status}</Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map(opt => (
                                <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" aria-label="Rechnung herunterladen" onClick={() => handleDownloadInvoice(invoice.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label="Erinnerung senden" 
                        onClick={() => handleSendReminder(invoice)} 
                        disabled={invoice.status === 'Bezahlt' || invoice.status === 'Entwurf'}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">Keine Rechnungen gefunden.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
