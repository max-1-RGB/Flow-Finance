
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, FilePlus2, FileArchive, PlusCircle, Trash2, Eye, Download, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

// Mock Data - In a real app, this would come from a database
const initialPersonnel = [
  { id: "1", name: "Anna Schmidt", position: "Videografin", email: "anna.s@example.com", phone: "0123456789", hireDate: "2023-08-15", employmentType: "Festanstellung", salary: 4200, salaryType: "Monatlich", weeklyHours: 40, address: "Musterweg 1, 12345 Musterstadt", notes: "" },
  { id: "2", name: "Ben Weber", position: "Editor (Freelancer)", email: "ben.weber@freelance.de", phone: "0987654321", hireDate: "2024-01-10", employmentType: "Freelancer", salary: 75, salaryType: "Stündlich", weeklyHours: 20, address: "Beispielallee 22, 54321 Beispielhausen", notes: "" },
];

const initialDocuments = [
    { id: 'doc1', personnelId: '1', name: 'Arbeitsvertrag', type: 'Vertrag', uploadDate: '2023-08-15', fileUrl: '#' },
    { id: 'doc2', personnelId: '1', name: 'Abschlusszeugnis (Master)', type: 'Qualifikationsnachweis', uploadDate: '2023-08-15', fileUrl: '#' },
    { id: 'doc3', personnelId: '2', name: 'Freelancer-Vertrag', type: 'Vertrag', uploadDate: '2024-01-10', fileUrl: '#' },
];

type EmploymentType = "Festanstellung" | "Teilzeit" | "Freelancer" | "Praktikant";
type SalaryType = "Monatlich" | "Stündlich";
type DocumentType = "Vertrag" | "Qualifikationsnachweis" | "Zeugnis" | "Abmahnung" | "Sonstiges";

interface Personnel {
  id: string;
  name: string;
  position: string;
  email: string;
  phone?: string;
  hireDate: string;
  employmentType: EmploymentType;
  salary?: number;
  salaryType?: SalaryType;
  weeklyHours?: number;
  notes?: string;
  address?: string;
}

interface Document {
    id: string;
    personnelId: string;
    name: string;
    type: DocumentType;
    uploadDate: string;
    fileUrl?: string;
}

export default function PersonnelDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  
  const [person, setPerson] = useState<Personnel | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDocDialogOpen, setDocDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch person and their documents
    const personData = initialPersonnel.find(p => p.id === params.id) || null;
    const personDocuments = initialDocuments.filter(d => d.personnelId === params.id);
    
    setPerson(personData);
    setDocuments(personDocuments);

  }, [params.id]);

  const handleDataSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!person) return;
    
    const formData = new FormData(event.currentTarget);
    const updatedPerson: Personnel = {
      ...person,
      name: formData.get('name') as string,
      position: formData.get('position') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      employmentType: formData.get('employmentType') as EmploymentType,
      salary: parseFloat(formData.get('salary') as string),
      salaryType: formData.get('salaryType') as SalaryType,
      weeklyHours: parseInt(formData.get('weeklyHours') as string),
      notes: formData.get('notes') as string,
    };
    
    // In a real app, you would save this to your database
    setPerson(updatedPerson);
    // Also update the mock list for consistency
    const index = initialPersonnel.findIndex(p => p.id === person.id);
    if (index !== -1) {
      initialPersonnel[index] = updatedPerson;
    }
    
    toast({ title: "Stammdaten gespeichert", description: "Die Daten wurden erfolgreich aktualisiert." });
  };
  
  const handleAddDocument = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!person) return;
    const formData = new FormData(event.currentTarget);
    const newDoc: Document = {
      id: `doc${Date.now()}`,
      personnelId: person.id,
      name: formData.get('name') as string,
      type: formData.get('type') as DocumentType,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setDocuments(prev => [...prev, newDoc]);
    setDocDialogOpen(false);
    toast({ title: "Dokument hinzugefügt" });
  };
  
  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast({ title: "Dokument gelöscht" });
  }

  const showNotImplemented = (action: string) => {
      toast({ title: "Funktion nicht verfügbar", description: `Die Aktion "${action}" ist in diesem Prototyp nicht implementiert.`});
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (!person) {
    return <div>Lade Mitarbeiterdaten...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="font-headline text-3xl font-semibold tracking-tight">{person.name}</h1>
            <p className="text-muted-foreground">{person.position}</p>
        </div>
        <Button onClick={() => router.push(`/personnel/${person.id}/contracts/create`)}>
            <FilePlus2 className="mr-2 h-4 w-4" /> Neuen Vertrag erstellen
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Stammdaten */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Stammdaten</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDataSave} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={person.name} />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" name="position" defaultValue={person.position} />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" name="email" type="email" defaultValue={person.email} />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={person.phone} />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea id="address" name="address" defaultValue={person.address} rows={3} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="employmentType">Anstellungsart</Label>
                    <Select name="employmentType" defaultValue={person.employmentType}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Festanstellung">Festanstellung</SelectItem>
                            <SelectItem value="Teilzeit">Teilzeit</SelectItem>
                            <SelectItem value="Freelancer">Freelancer</SelectItem>
                            <SelectItem value="Praktikant">Praktikant</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="salaryType">Gehaltsart</Label>
                        <Select name="salaryType" defaultValue={person.salaryType}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Monatlich">Monatlich</SelectItem>
                                <SelectItem value="Stündlich">Stündlich</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="salary">Gehalt/Satz (€)</Label>
                        <Input id="salary" name="salary" type="number" step="0.01" defaultValue={person.salary} />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <Label htmlFor="weeklyHours">Wochenstunden</Label>
                    <Input id="weeklyHours" name="weeklyHours" type="number" defaultValue={person.weeklyHours} />
                 </div>
                 <div className="space-y-1">
                  <Label htmlFor="notes">Notizen</Label>
                  <Textarea id="notes" name="notes" defaultValue={person.notes} rows={3} />
                </div>
                <Button type="submit" className="w-full">Daten speichern</Button>
            </form>
          </CardContent>
        </Card>

        {/* Personalakte */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><FileArchive className="h-5 w-5 text-primary" /> Personalakte</CardTitle>
                    <Dialog open={isDocDialogOpen} onOpenChange={setDocDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Dokument hinzufügen</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Neues Dokument zur Personalakte hinzufügen</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddDocument} className="space-y-4">
                                <div>
                                    <Label htmlFor="doc-name">Dokumentenname</Label>
                                    <Input id="doc-name" name="name" required />
                                </div>
                                <div>
                                    <Label htmlFor="doc-type">Dokumententyp</Label>
                                    <Select name="type" required>
                                        <SelectTrigger><SelectValue placeholder="Typ auswählen..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Vertrag">Vertrag</SelectItem>
                                            <SelectItem value="Qualifikationsnachweis">Qualifikationsnachweis</SelectItem>
                                            <SelectItem value="Zeugnis">Zeugnis</SelectItem>
                                            <SelectItem value="Abmahnung">Abmahnung</SelectItem>
                                            <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div>
                                    <Label htmlFor="doc-file">Datei hochladen</Label>
                                    <Input id="doc-file" name="file" type="file" required />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Hinzufügen</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <CardDescription>Verwalten Sie alle wichtigen Dokumente für {person.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Dokument</TableHead>
                            <TableHead>Typ</TableHead>
                            <TableHead>Hochgeladen am</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.length > 0 ? documents.map(doc => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">{doc.name}</TableCell>
                                <TableCell>{doc.type}</TableCell>
                                <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => showNotImplemented("Vorschau")}><Eye className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => showNotImplemented("Download")}><Download className="h-4 w-4" /></Button>
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
                                            <AlertDialogAction onClick={() => handleDeleteDocument(doc.id)}>Löschen</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Keine Dokumente für diesen Mitarbeiter vorhanden.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
