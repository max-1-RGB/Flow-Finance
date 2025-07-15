
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Camera, Mic, Film, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type EquipmentType = "Kamera" | "Objektiv" | "Mikrofon" | "Licht" | "Stativ" | "Drohne" | "Computer" | "Software" | "Sonstiges";

interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  brand: string;
  serialNumber?: string;
}

const initialEquipment: EquipmentItem[] = [
  { id: "1", name: "Sony Alpha 7 IV", type: "Kamera", brand: "Sony", serialNumber: "SN12345678" },
  { id: "2", name: "Sigma 24-70mm f/2.8", type: "Objektiv", brand: "Sigma" },
  { id: "3", name: "Rode NTG5", type: "Mikrofon", brand: "Rode" },
  { id: "4", name: "Aputure 120D II", type: "Licht", brand: "Aputure" },
  { id: "5", name: "Manfrotto Befree", type: "Stativ", brand: "Manfrotto" },
  { id: "6", name: "DJI Mavic 3 Pro", type: "Drohne", brand: "DJI", serialNumber: "SN98765432" },
];

const typeIcons: Record<EquipmentType, React.ElementType> = {
  "Kamera": Camera,
  "Objektiv": Camera,
  "Mikrofon": Mic,
  "Licht": Film,
  "Stativ": Wrench,
  "Drohne": Film,
  "Computer": Wrench,
  "Software": Wrench,
  "Sonstiges": Wrench,
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>(initialEquipment);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const itemData: Omit<EquipmentItem, 'id'> = {
      name: formData.get('name') as string,
      type: formData.get('type') as EquipmentType,
      brand: formData.get('brand') as string,
      serialNumber: formData.get('serialNumber') as string,
    };

    if (editingItem) {
      setEquipment(equipment.map(p => p.id === editingItem.id ? { ...editingItem, ...itemData } : p));
      toast({ title: "Gegenstand aktualisiert" });
    } else {
      setEquipment([...equipment, { ...itemData, id: Date.now().toString() }]);
      toast({ title: "Neuer Gegenstand hinzugefügt" });
    }

    setDialogOpen(false);
    setEditingItem(null);
  };

  const openDialog = (item: EquipmentItem | null) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEquipment(equipment.filter(p => p.id !== id));
    toast({ title: "Gegenstand gelöscht" });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Inventarliste
        </h1>
        <Button onClick={() => openDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Gegenstand hinzufügen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ihr Equipment</CardTitle>
          <CardDescription>Behalten Sie den Überblick über Ihre gesamte Ausrüstung.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Typ</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Marke</TableHead>
                <TableHead>Seriennummer</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.length > 0 ? equipment.map((item) => {
                const Icon = typeIcons[item.type] || Wrench;
                return (
                    <TableRow key={item.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {item.type}
                        </div>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell>{item.serialNumber || 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
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
                  <TableCell colSpan={5} className="h-24 text-center">Noch kein Equipment erfasst.</TableCell>
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
            <DialogTitle>{editingItem ? 'Gegenstand bearbeiten' : 'Neuen Gegenstand erfassen'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" name="name" defaultValue={editingItem?.name} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Typ</Label>
               <Select name="type" defaultValue={editingItem?.type || "Kamera"} required>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(typeIcons).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">Marke</Label>
              <Input id="brand" name="brand" defaultValue={editingItem?.brand} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serialNumber" className="text-right">Seriennr.</Label>
              <Input id="serialNumber" name="serialNumber" defaultValue={editingItem?.serialNumber} className="col-span-3" placeholder="Optional" />
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
