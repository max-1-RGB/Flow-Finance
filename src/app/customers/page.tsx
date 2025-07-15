
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, User, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';

interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  zipCity?: string;
  country?: string;
  website?: string;
  notes?: string;
}

const initialCustomers: Customer[] = [
  { id: "1", name: "Erika Mustermann", company: "Acme Corp", email: "erika@acme.com", phone: "+49123456789", address: "Musterstraße 1", zipCity: "12345 Musterstadt", country: "Deutschland", website: "https://acme.com" },
  { id: "2", name: "John Doe", company: "Beta LLC", email: "john.d@beta.llc" },
  { id: "3", name: "Max Power", company: "Gamma Inc", phone: "+49987654321", website: "https://gamma.inc" },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const customerData: Omit<Customer, 'id'> = {
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      zipCity: formData.get('zipCity') as string,
      country: formData.get('country') as string,
      website: formData.get('website') as string,
      notes: formData.get('notes') as string,
    };

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...customerData } : c));
      toast({ title: "Kunde aktualisiert" });
    } else {
      setCustomers([...customers, { ...customerData, id: Date.now().toString() }]);
      toast({ title: "Neuer Kunde hinzugefügt" });
    }

    setDialogOpen(false);
    setEditingCustomer(null);
  };

  const openDialog = (customer: Customer | null) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast({ title: "Kunde gelöscht" });
  };
  
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Kundenverwaltung
        </h1>
        <Button onClick={() => openDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Neuen Kunden anlegen
        </Button>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Kunden durchsuchen</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Nach Name oder Firma suchen..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Ihre Kunden</CardTitle>
          <CardDescription>Verwalten Sie Ihre Kundenkontakte zentral an einem Ort.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Webseite</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.company || "N/A"}</TableCell>
                    <TableCell>{customer.email || "N/A"}</TableCell>
                    <TableCell>{customer.website || "N/A"}</TableCell>
                    <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(customer)}><Edit className="h-4 w-4" /></Button>
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
                                <AlertDialogAction onClick={() => handleDelete(customer.id)}>Löschen</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Noch keine Kunden angelegt.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) setEditingCustomer(null);
        setDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Kunden bearbeiten' : 'Neuen Kunden anlegen'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editingCustomer?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Firma (optional)</Label>
                <Input id="company" name="company" defaultValue={editingCustomer?.company} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail (optional)</Label>
                <Input id="email" name="email" type="email" defaultValue={editingCustomer?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon (optional)</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={editingCustomer?.phone} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Straße & Hausnummer (optional)</Label>
              <Input id="address" name="address" defaultValue={editingCustomer?.address} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="zipCity">PLZ & Ort (optional)</Label>
                <Input id="zipCity" name="zipCity" defaultValue={editingCustomer?.zipCity} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Land (optional)</Label>
                <Input id="country" name="country" defaultValue={editingCustomer?.country} />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="website">Webseite (optional)</Label>
              <Input id="website" name="website" type="url" defaultValue={editingCustomer?.website} placeholder="https://beispiel.de"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea id="notes" name="notes" defaultValue={editingCustomer?.notes} />
            </div>
            <DialogFooter>
              <Button type="submit">{editingCustomer ? 'Speichern' : 'Anlegen'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
