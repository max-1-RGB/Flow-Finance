
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Users, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type EmploymentType = "Festanstellung" | "Teilzeit" | "Freelancer" | "Praktikant";
type SalaryType = "Monatlich" | "Stündlich";

interface Personnel {
  id: string;
  name: string;
  position: string;
  email: string;
  phone?: string;
  hireDate: string; // ISO String
  employmentType: EmploymentType;
  salary?: number;
  salaryType?: SalaryType;
  weeklyHours?: number;
  notes?: string;
  address?: string; // Hinzugefügt für Vertragserstellung
}

const initialPersonnel: Personnel[] = [
  { id: "1", name: "Anna Schmidt", position: "Videografin", email: "anna.s@example.com", hireDate: "2023-08-15", employmentType: "Festanstellung", salary: 4200, salaryType: "Monatlich", weeklyHours: 40, address: "Musterweg 1, 12345 Musterstadt" },
  { id: "2", name: "Ben Weber", position: "Editor (Freelancer)", email: "ben.weber@freelance.de", hireDate: "2024-01-10", employmentType: "Freelancer", salary: 75, salaryType: "Stündlich", weeklyHours: 20, address: "Beispielallee 22, 54321 Beispielhausen" },
];

export default function PersonnelPage() {
  const [personnelList, setPersonnelList] = useState<Personnel[]>(initialPersonnel);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (e) {
      return "Ungültiges Datum";
    }
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };
  
  const formatSalary = (p: Personnel): string => {
    if (!p.salary) return "N/A";
    const salaryStr = formatCurrency(p.salary);
    if (p.salaryType === 'Stündlich') return `${salaryStr} / Std.`;
    return salaryStr;
  }

  const getHtmlInputDate = (dateString?: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  useEffect(() => {
    if (searchParams.get('action') === 'add_from_recruiting') {
      const newPersonnelDataString = localStorage.getItem('newPersonnelFromRecruiting');
      if (newPersonnelDataString) {
        try {
          const newPersonnelData = JSON.parse(newPersonnelDataString);
          setEditingPersonnel({
            id: '', // Empty id indicates a new entry
            name: newPersonnelData.name || '',
            position: newPersonnelData.position || '',
            email: newPersonnelData.email || '',
            phone: newPersonnelData.phone || '',
            hireDate: newPersonnelData.hireDate || new Date().toISOString().split('T')[0],
            employmentType: 'Festanstellung', // Default value
            address: newPersonnelData.address || '',
            salary: undefined,
            salaryType: 'Monatlich',
            weeklyHours: undefined,
            notes: 'Automatisch aus Recruiting übernommen.'
          });
          setDialogOpen(true);
        } catch(e) {
          console.error("Could not parse personnel data from recruiting", e);
        } finally {
          localStorage.removeItem('newPersonnelFromRecruiting');
          // Clean up the URL
          router.replace('/personnel', { scroll: false });
        }
      }
    }
  }, [searchParams, router]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const personnelData: Omit<Personnel, 'id'> = {
      name: formData.get('name') as string,
      position: formData.get('position') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      hireDate: formData.get('hireDate') as string,
      employmentType: formData.get('employmentType') as EmploymentType,
      salary: formData.get('salary') ? parseFloat(formData.get('salary') as string) : undefined,
      salaryType: formData.get('salaryType') as SalaryType,
      weeklyHours: formData.get('weeklyHours') ? parseInt(formData.get('weeklyHours') as string) : undefined,
      notes: formData.get('notes') as string,
    };

    if (editingPersonnel && editingPersonnel.id) {
      const updatedList = personnelList.map(p => p.id === editingPersonnel.id ? { ...editingPersonnel, ...personnelData } : p);
      setPersonnelList(updatedList);
      Object.assign(initialPersonnel, updatedList); // Update mock data source
      toast({ title: "Personal-Eintrag aktualisiert" });
    } else {
      const newEntry = { ...personnelData, id: Date.now().toString() };
      setPersonnelList([...personnelList, newEntry]);
      initialPersonnel.push(newEntry); // Update mock data source
      toast({ title: "Neue Person hinzugefügt" });
    }

    setDialogOpen(false);
    setEditingPersonnel(null);
  };

  const openDialog = (person: Personnel | null) => {
    setEditingPersonnel(person);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPersonnelList(personnelList.filter(p => p.id !== id));
    const index = initialPersonnel.findIndex(p => p.id === id);
    if(index > -1) initialPersonnel.splice(index, 1);
    toast({ title: "Eintrag gelöscht" });
  };
  
  const filteredPersonnel = useMemo(() => {
    return personnelList.filter(person => 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [personnelList, searchTerm]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Personalverwaltung
        </h1>
        <Button onClick={() => openDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Neue Person anlegen
        </Button>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Personal durchsuchen</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Nach Name oder Position suchen..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Ihr Team</CardTitle>
          <CardDescription>Verwalten Sie Ihre Mitarbeiter und Freelancer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Anstellungsart</TableHead>
                <TableHead>Gehalt</TableHead>
                <TableHead>Eingestellt am</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonnel.length > 0 ? filteredPersonnel.map((person) => (
                <TableRow key={person.id} className="cursor-pointer" onClick={() => router.push(`/personnel/${person.id}`)}>
                    <TableCell className="font-medium text-primary hover:underline">
                      {person.name}
                    </TableCell>
                    <TableCell>{person.position}</TableCell>
                    <TableCell>{person.employmentType}</TableCell>
                    <TableCell>{formatSalary(person)}</TableCell>
                    <TableCell>{formatDate(person.hireDate)}</TableCell>
                    <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDialog(person); }}><Edit className="h-4 w-4" /></Button>
                        <AlertDialog onOpenChange={(e) => e.valueOf() && e.stopPropagation()}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                                <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(person.id)}>Löschen</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Noch keine Einträge vorhanden.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) setEditingPersonnel(null);
        setDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPersonnel?.id ? 'Eintrag bearbeiten' : 'Neue Person anlegen'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editingPersonnel?.name} required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" name="position" defaultValue={editingPersonnel?.position} required />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" name="email" type="email" defaultValue={editingPersonnel?.email} required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone">Telefon (optional)</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={editingPersonnel?.phone} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" name="address" defaultValue={editingPersonnel?.address} required />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentType">Anstellungsart</Label>
                <Select name="employmentType" defaultValue={editingPersonnel?.employmentType || "Festanstellung"} required>
                  <SelectTrigger id="employmentType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Festanstellung">Festanstellung</SelectItem>
                    <SelectItem value="Teilzeit">Teilzeit</SelectItem>
                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                    <SelectItem value="Praktikant">Praktikant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Eingestellt am</Label>
                <Input id="hireDate" name="hireDate" type="date" defaultValue={getHtmlInputDate(editingPersonnel?.hireDate)} required />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="salaryType">Gehaltsart</Label>
                <Select name="salaryType" defaultValue={editingPersonnel?.salaryType || "Monatlich"} required>
                  <SelectTrigger id="salaryType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monatlich">Monatlich</SelectItem>
                    <SelectItem value="Stündlich">Stündlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="salary">Gehalt/Stundensatz (€)</Label>
                <Input id="salary" name="salary" type="number" step="0.01" defaultValue={editingPersonnel?.salary} />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="weeklyHours">Wochenstunden (optional)</Label>
                <Input id="weeklyHours" name="weeklyHours" type="number" defaultValue={editingPersonnel?.weeklyHours} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea id="notes" name="notes" defaultValue={editingPersonnel?.notes} />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">{editingPersonnel?.id ? 'Speichern' : 'Anlegen'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
