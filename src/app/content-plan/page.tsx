
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type UploadStatus = "Idee" | "In Planung" | "Aufnahme" | "Schnitt" | "Review" | "Geplant" | "Veröffentlicht";

interface UploadPlan {
  id: string;
  title: string;
  platform: string;
  status: UploadStatus;
  publishDate: string;
  notes?: string;
  tags?: string[];
}

const initialPlans: UploadPlan[] = [
  { id: "1", title: "Unboxing neues Kamera-Objektiv", platform: "YouTube", status: "Schnitt", publishDate: "2024-08-15", notes: "Color Grading fehlt noch", tags: ["Technik", "Kamera"] },
  { id: "2", title: "Tutorial: Bessere Landschaftsfotos", platform: "YouTube", status: "Veröffentlicht", publishDate: "2024-07-20", tags: ["Fotografie", "Tutorial"] },
  { id: "3", title: "Hinter den Kulissen: Mein Setup 2024", platform: "Instagram Reel", status: "In Planung", publishDate: "2024-08-25", notes: "Kurze Clips vom Arbeitsplatz sammeln" },
  { id: "4", title: "Podcast-Episode mit Gast XY", platform: "Podcast", status: "Aufnahme", publishDate: "2024-08-18", notes: "Audio-Spuren synchronisieren" },
];

const statusColors: Record<UploadStatus, "default" | "secondary" | "destructive" | "outline"> = {
    "Idee": "outline",
    "In Planung": "secondary",
    "Aufnahme": "destructive", // Using destructive to show urgency
    "Schnitt": "secondary",
    "Review": "secondary",
    "Geplant": "default",
    "Veröffentlicht": "default",
};

export default function ContentPlanPage() {
  const [plans, setPlans] = useState<UploadPlan[]>(initialPlans);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<UploadPlan | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const planData: Omit<UploadPlan, 'id'> = {
      title: formData.get('title') as string,
      platform: formData.get('platform') as string,
      status: formData.get('status') as UploadStatus,
      publishDate: formData.get('publishDate') as string,
      notes: formData.get('notes') as string,
      tags,
    };

    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...editingPlan, ...planData } : p));
      toast({ title: "Plan aktualisiert" });
    } else {
      setPlans([...plans, { ...planData, id: Date.now().toString() }]);
      toast({ title: "Neuer Plan hinzugefügt" });
    }

    setDialogOpen(false);
    setEditingPlan(null);
  };

  const openDialog = (plan: UploadPlan | null) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
    toast({ title: "Plan gelöscht" });
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Inhaltsplan
        </h1>
        <Button onClick={() => openDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Neuen Plan erstellen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geplante Uploads</CardTitle>
          <CardDescription>Verwalten Sie Ihre anstehenden und vergangenen Veröffentlichungen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Plattform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Veröffentlichung</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length > 0 ? plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.title}</TableCell>
                  <TableCell>{plan.platform}</TableCell>
                  <TableCell><Badge variant={statusColors[plan.status]}>{plan.status}</Badge></TableCell>
                  <TableCell>{formatDate(plan.publishDate)}</TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(plan)}><Edit className="h-4 w-4" /></Button>
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
                            <AlertDialogAction onClick={() => handleDelete(plan.id)}>Löschen</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Noch keine Pläne erstellt.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) setEditingPlan(null);
        setDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Plan bearbeiten' : 'Neuen Plan erstellen'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Titel</Label>
              <Input id="title" name="title" defaultValue={editingPlan?.title} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="platform" className="text-right">Plattform</Label>
               <Select name="platform" defaultValue={editingPlan?.platform || "YouTube"} required>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Instagram Reel">Instagram Reel</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Podcast">Podcast</SelectItem>
                    <SelectItem value="Blog">Blog</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
               <Select name="status" defaultValue={editingPlan?.status || "Idee"} required>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(statusColors).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publishDate" className="text-right">Datum</Label>
              <Input id="publishDate" name="publishDate" type="date" defaultValue={editingPlan?.publishDate} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">Tags</Label>
              <Input id="tags" name="tags" defaultValue={editingPlan?.tags?.join(', ')} className="col-span-3" placeholder="tag1, tag2, ..." />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right mt-2">Notizen</Label>
              <Textarea id="notes" name="notes" defaultValue={editingPlan?.notes} className="col-span-3" />
            </div>
            <DialogFooter>
              <Button type="submit">{editingPlan ? 'Speichern' : 'Erstellen'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
