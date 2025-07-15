
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, UserPlus, Users, FilePlus2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ApplicationStatus = "Bewerbung eingegangen" | "Im Prozess" | "Interview" | "Angebot" | "Eingestellt" | "Abgelehnt";

interface Application {
  id: string;
  name: string;
  position: string;
  applicationDate: string; // ISO String
  email: string;
  phone?: string;
  status: ApplicationStatus;
  address?: string; // Add address for contract
}

const initialApplications: Application[] = [
  { id: "1", name: "Klara Fall", position: "Social Media Manager", applicationDate: "2024-07-28", email: "klara.f@example.com", status: "Interview", address: "Testweg 1, 12345 Berlin" },
  { id: "2", name: "Peter Pan", position: "Videograf", applicationDate: "2024-07-25", email: "peter.p@example.com", status: "Angebot", address: "Nimmerland Str 5, 54321 Fantasia" },
  { id: "3", name: "Maria Muster", position: "Editor", applicationDate: "2024-07-22", email: "maria.m@example.com", status: "Abgelehnt", address: "Am Beispiel 12, 98765 Beispielstadt" },
  { id: "4", name: "Tom Talent", position: "Videograf", applicationDate: "2024-07-29", email: "tom.t@example.com", status: "Bewerbung eingegangen", address: "Talentgasse 8, 11223 Begabthausen" },
];

const statusOptions: ApplicationStatus[] = ["Bewerbung eingegangen", "Im Prozess", "Interview", "Angebot", "Eingestellt", "Abgelehnt"];

export default function RecruitingPage() {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newApplication: Application = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      position: formData.get('position') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      applicationDate: new Date().toISOString().split('T')[0],
      status: "Bewerbung eingegangen",
    };

    setApplications(prev => [newApplication, ...prev].sort((a,b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()));
    setDialogOpen(false);
    toast({ title: "Bewerbung hinzugefügt" });
  };
  
  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    toast({ title: "Status aktualisiert", description: `Der Status für die Bewerbung wurde auf "${newStatus}" geändert.` });
  };

  const handleCreateContract = (application: Application) => {
     const contractData = {
      id: application.id,
      name: application.name,
      position: application.position,
      address: application.address,
      hireDate: new Date().toISOString().split('T')[0],
      isApplicant: true,
    };
    localStorage.setItem('personnelForContract', JSON.stringify(contractData));
    router.push(`/personnel/${application.id}/contracts/create`);
  };
  
  const handleHire = (application: Application) => {
    // In a real app, you would likely save the new personnel to a database.
    // Here we use localStorage to pass the data to the personnel page.
    const newPersonnelData = {
      name: application.name,
      position: application.position,
      email: application.email,
      phone: application.phone,
      address: application.address,
      hireDate: new Date().toISOString().split('T')[0],
    };
    localStorage.setItem('newPersonnelFromRecruiting', JSON.stringify(newPersonnelData));
    
    // Remove from applications list
    setApplications(prev => prev.filter(app => app.id !== application.id));
    
    toast({ title: "Person eingestellt!", description: `${application.name} wurde zur Personalverwaltung verschoben.` });
    router.push('/personnel?action=add_from_recruiting');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Recruiting & Bewerbungen
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Neue Bewerbung anlegen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Bewerbung manuell anlegen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name des Bewerbers</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Beworbene Position</Label>
                <Input id="position" name="position" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon (optional)</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse (optional)</Label>
                <Input id="address" name="address" />
              </div>
              <DialogFooter>
                <Button type="submit">Anlegen</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Bewerber-Pipeline</CardTitle>
          <CardDescription>Verwalten Sie alle eingehenden Bewerbungen an einem Ort.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Beworben am</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>{app.position}</TableCell>
                  <TableCell>{formatDate(app.applicationDate)}</TableCell>
                  <TableCell>
                    <Select value={app.status} onValueChange={(value) => handleStatusChange(app.id, value as ApplicationStatus)}>
                        <SelectTrigger className="w-[200px] h-8 text-xs">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    {app.status === 'Angebot' && (
                       <Button size="sm" variant="outline" onClick={() => handleCreateContract(app)}>
                         <FilePlus2 className="mr-2 h-4 w-4"/> Vertrag erstellen
                       </Button>
                    )}
                    {app.status === 'Eingestellt' && (
                      <Button size="sm" onClick={() => handleHire(app)}>
                        <UserPlus className="mr-2 h-4 w-4"/> Übernehmen
                      </Button>
                    )}
                    {(app.status !== 'Angebot' && app.status !== 'Eingestellt') && (
                      <span className="text-xs text-muted-foreground">Status ändern...</span>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Keine Bewerbungen vorhanden.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
