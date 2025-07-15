
"use client";

import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, UploadCloud, FileText, Repeat, Users, BookOpen, Tag, Trash2, PlusCircle, Calculator, Edit, Briefcase } from "lucide-react";
import { AppearanceCard } from "@/components/settings/AppearanceCard";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface CostItem {
  id: string;
  name: string;
  value: number;
}

const getDefaultCostItems = (): CostItem[] => [
    { id: "1", name: "Tagessatz", value: 800 },
    { id: "2", name: "Reisekosten pro km", value: 0.50 },
    { id: "3", name: "Unterkunftspauschale pro Nacht", value: 150 },
    { id: "4", name: "Nachbearbeitung Pauschale in %", value: 25 },
];


export default function SettingsPage() {
  const { toast } = useToast();
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categories, setCategories] = useState(['Lebensmittel', 'Transport', 'Unterhaltung', 'Miete', 'Gehalt', 'Bürobedarf', 'Umsatz', 'Software']);
  
  // State for quote cost items
  const [isCostItemDialogOpen, setCostItemDialogOpen] = useState(false);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [editingCostItem, setEditingCostItem] = useState<CostItem | null>(null);

  // State for company info
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // State for invoice info
  const [taxNumber, setTaxNumber] = useState('');
  const [bankDetails, setBankDetails] = useState('');


  useEffect(() => {
    // Load cost items from localStorage on component mount
    const storedCostItems = localStorage.getItem('costItems');
    if (storedCostItems) {
      try {
        setCostItems(JSON.parse(storedCostItems));
      } catch (e) {
        setCostItems(getDefaultCostItems());
      }
    } else {
        setCostItems(getDefaultCostItems());
    }

    // Load company info from localStorage
    const storedCompanyInfo = localStorage.getItem('companyInfo');
    if (storedCompanyInfo) {
      const { name, address } = JSON.parse(storedCompanyInfo);
      setCompanyName(name || '');
      setCompanyAddress(address || '');
    }
    
    // Load invoice info from localStorage
    const storedInvoiceInfo = localStorage.getItem('invoiceInfo');
    if (storedInvoiceInfo) {
        const { taxNumber, bankDetails } = JSON.parse(storedInvoiceInfo);
        setTaxNumber(taxNumber || '');
        setBankDetails(bankDetails || '');
    }


  }, []);

  const handleAddCategory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newCategory = formData.get('category') as string;
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory].sort());
      toast({ title: "Kategorie hinzugefügt", description: `Die Kategorie "${newCategory}" wurde erstellt.` });
      (event.target as HTMLFormElement).reset();
    } else {
       toast({ title: "Fehler", description: `Die Kategorie existiert bereits oder ist ungültig.`, variant: "destructive" });
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    setCategories(prev => prev.filter(c => c !== categoryToDelete));
    toast({ title: "Kategorie gelöscht", description: `Die Kategorie "${categoryToDelete}" wurde entfernt.` });
  };
  
  const handleCostItemFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const value = parseFloat(formData.get('value') as string);
    
    if(!name || isNaN(value)) {
        toast({ title: "Fehler", description: "Bitte geben Sie einen gültigen Namen und Wert an.", variant: "destructive" });
        return;
    }

    let updatedItems;
    if (editingCostItem) {
        // Update existing item
        updatedItems = costItems.map(item => item.id === editingCostItem.id ? { ...item, name, value } : item);
        toast({ title: "Kostenstelle aktualisiert" });
    } else {
        // Add new item
        const newItem = { id: Date.now().toString(), name, value };
        updatedItems = [...costItems, newItem];
        toast({ title: "Kostenstelle hinzugefügt" });
    }
    
    setCostItems(updatedItems);
    localStorage.setItem('costItems', JSON.stringify(updatedItems));
    setEditingCostItem(null);
    form.reset();
  };

  const handleDeleteCostItem = (id: string) => {
      const updatedItems = costItems.filter(item => item.id !== id);
      setCostItems(updatedItems);
      localStorage.setItem('costItems', JSON.stringify(updatedItems));
      toast({ title: "Kostenstelle gelöscht" });
  };
  
  const openEditCostItemDialog = (item: CostItem) => {
    setEditingCostItem(item);
  };
  
  const closeCostItemDialog = () => {
    setCostItemDialogOpen(false);
    setEditingCostItem(null);
  };
  
  const handleCompanyInfoSave = () => {
    const companyInfo = { name: companyName, address: companyAddress };
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    toast({
      title: "Firmendaten gespeichert",
      description: "Ihre Firmendaten wurden erfolgreich aktualisiert.",
    });
  };

  const handleInvoiceInfoSave = () => {
    const invoiceInfo = { taxNumber, bankDetails };
    localStorage.setItem('invoiceInfo', JSON.stringify(invoiceInfo));
    toast({
      title: "Rechnungsdaten gespeichert",
      description: "Ihre Daten für Rechnungen wurden erfolgreich aktualisiert.",
    });
  };

  const showNotImplementedToast = () => {
    toast({
      title: "Noch nicht implementiert",
      description: "Diese Funktion ist in Kürze verfügbar.",
      variant: "default",
    });
  };

  const handleProfileUpdate = () => {
    toast({
      title: "Profil aktualisiert",
      description: "Ihre Informationen wurden erfolgreich gespeichert.",
    });
  };

  const handleAccountDelete = () => {
    toast({
      title: "Konto gelöscht",
      description: "Ihr Konto wurde erfolgreich gelöscht (Simulation).",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight">
        Einstellungen
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Profil</CardTitle>
          <CardDescription>Verwalten Sie Ihre persönlichen Informationen und Kontodetails.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Vollständiger Name</Label>
              <Input id="name" defaultValue="Max Mustermann" />
            </div>
            <div>
              <Label htmlFor="email">E-Mail Adresse</Label>
              <Input id="email" type="email" defaultValue="max.mustermann@example.com" />
            </div>
          </div>
          <Button onClick={handleProfileUpdate}>Profil aktualisieren</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Firmendaten</CardTitle>
          <CardDescription>Diese Informationen werden für Verträge und Kostenvoranschläge verwendet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Firmenname</Label>
            <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ihre Firma GmbH" />
          </div>
          <div>
            <Label htmlFor="companyAddress">Firmenadresse</Label>
            <Textarea id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Firmenstraße 1, 12345 Stadt" />
          </div>
           <div>
            <Label htmlFor="logo">Firmenlogo (simuliert)</Label>
            <Input id="logo" type="file" />
          </div>
          <Button onClick={handleCompanyInfoSave}>Firmendaten speichern</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Rechnungsdaten</CardTitle>
          <CardDescription>Gesetzlich erforderliche Angaben für Ihre Rechnungen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="taxNumber">Steuernummer oder USt-IdNr.</Label>
            <Input id="taxNumber" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} placeholder="DE123456789" />
          </div>
          <div>
            <Label htmlFor="bankDetails">Bankverbindung</Label>
            <Textarea id="bankDetails" value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} placeholder="Bank: Musterbank&#10;IBAN: DE00 1234 5678 9012 3456 78&#10;BIC: MÜSTDEFFXXX" />
          </div>
          <Button onClick={handleInvoiceInfoSave}>Rechnungsdaten speichern</Button>
        </CardContent>
      </Card>

      <AppearanceCard />
      
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary"/> Kostenvoranschlag</CardTitle>
          <CardDescription>Verwalten Sie Ihre Standard-Kostenstellen für den Kostenvoranschlagsrechner.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isCostItemDialogOpen} onOpenChange={setCostItemDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setCostItemDialogOpen(true)}>Kostenstellen verwalten</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kostenstellen verwalten</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {costItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between rounded-md p-2 bg-muted/50">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.value.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}</p>
                      </div>
                      <div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCostItemDialog(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                                    <AlertDialogDescription>Diese Kostenstelle wird dauerhaft gelöscht.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCostItem(item.id)}>Löschen</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleCostItemFormSubmit} className="flex flex-col gap-4 border-t pt-4">
                  <h3 className="font-semibold">{editingCostItem ? "Kostenstelle bearbeiten" : "Neue Kostenstelle hinzufügen"}</h3>
                  <div className="flex gap-2">
                    <Input name="name" placeholder="Name der Kostenstelle" defaultValue={editingCostItem?.name || ''} required />
                    <Input name="value" type="number" step="0.01" placeholder="Wert in €" defaultValue={editingCostItem?.value || ''} required />
                  </div>
                  <div className="flex justify-end gap-2">
                    {editingCostItem && <Button variant="ghost" type="button" onClick={() => setEditingCostItem(null)}>Abbrechen</Button>}
                    <Button type="submit">{editingCostItem ? "Speichern" : "Hinzufügen"}</Button>
                  </div>
                </form>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={closeCostItemDialog}>Schließen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-primary"/> Kategorien &amp; Tags</CardTitle>
          <CardDescription>Verwalten Sie Ihre benutzerdefinierten Ausgaben- und Einnahmenkategorien und Tags.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Kategorien verwalten</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kategorien verwalten</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {categories.map(category => (
                    <li key={category} className="flex items-center justify-between rounded-md p-2 bg-muted/50">
                      <span>{category}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCategory(category)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={handleAddCategory} className="flex gap-2 border-t pt-4">
                  <Input name="category" placeholder="Neue Kategorie..." required />
                  <Button type="submit" size="icon"><PlusCircle className="h-4 w-4" /></Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={showNotImplementedToast}>Tags verwalten</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Datenexport</CardTitle>
          <CardDescription>Exportieren Sie Ihre Finanzdaten für Buchhaltung oder Steuerzwecke.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={showNotImplementedToast}>Als CSV exportieren</Button>
          <Button variant="outline" onClick={showNotImplementedToast}>Als PDF exportieren</Button>
          <Button variant="outline" onClick={showNotImplementedToast}>Für DATEV exportieren</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UploadCloud className="h-5 w-5 text-primary"/> Dokumentenscan</CardTitle>
          <CardDescription>Laden Sie Belege oder Rechnungen hoch und verarbeiten Sie sie.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/ai-scan" passHref>
            <Button variant="outline">Neues Dokument scannen</Button>
          </Link>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Geteilte Wallets</CardTitle>
          <CardDescription>Verwalten Sie geteilte Budgets oder Konten mit anderen.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="outline" onClick={showNotImplementedToast}>Geteilte Wallets verwalten</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary"/> Sicherheit &amp; Datenschutz</CardTitle>
          <CardDescription>Verwalten Sie Ihre Sicherheitseinstellungen und Datenschutzpräferenzen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
            <Label htmlFor="2fa" className="flex flex-col space-y-1">
              <span>Zwei-Faktor-Authentifizierung (2FA)</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Erhöhen Sie die Sicherheit Ihres Kontos.
              </span>
            </Label>
            <Button variant="outline" id="2fa" onClick={showNotImplementedToast}>2FA aktivieren</Button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Konto löschen</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion kann nicht rückgängig gemacht werden. Dadurch werden Ihr Konto und alle Ihre Daten dauerhaft von unseren Servern gelöscht.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleAccountDelete}>Konto löschen</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/> Lernzentrum</CardTitle>
          <CardDescription>Greifen Sie auf Ressourcen zur Finanzbildung zu.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="outline" onClick={showNotImplementedToast}>Zum Lernzentrum</Button>
        </CardContent>
      </Card>
    </div>
  );
}
