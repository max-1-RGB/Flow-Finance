
"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileScan, RotateCcw, CheckCircle } from "lucide-react";
import Image from 'next/image';
import { scanDocument, ScanDocumentInput, ScanDocumentOutput } from '@/ai/flows/document-scanning'; 
import { useToast } from '@/hooks/use-toast';

interface ScannedData {
  amount: number;
  merchant: string;
  date: string;
  category: string;
}

export default function AIScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScannedData(null);
      setError(null);
    }
  };

  const handleScanDocument = async () => {
    if (!selectedFile) {
      setError("Bitte wählen Sie zuerst eine Datei aus.");
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte wählen Sie zuerst eine Datei aus.",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    setScannedData(null);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const input: ScanDocumentInput = { photoDataUri: base64data };
      try {
        const result: ScanDocumentOutput = await scanDocument(input);
        setScannedData(result);
      } catch (err) {
        console.error("Fehler beim Scannen des Dokuments:", err);
        setError("Dokument konnte nicht gescannt werden. Bitte versuchen Sie es erneut.");
        toast({
          variant: "destructive",
          title: "Scan Fehlgeschlagen",
          description: "Dokument konnte nicht gescannt werden. Bitte versuchen Sie es erneut oder mit einem anderen Bild.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Datei konnte nicht gelesen werden.");
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Datei konnte nicht gelesen werden.",
      });
      setIsLoading(false);
    };
  };

  const handleAddTransaction = () => {
    // In a real app, you would navigate or send this data somewhere
    toast({
      title: "Transaktion hinzugefügt",
      description: `Die Transaktion von ${scannedData?.merchant} wurde erfolgreich hinzugefügt.`,
    });
    handleRetry();
  };

  const handleRetry = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScannedData(null);
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight">
        Dokument scannen (OCR)
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" /> Beleg oder Rechnung hochladen
          </CardTitle>
          <CardDescription>Laden Sie ein Bild Ihres Dokuments hoch, um Informationen automatisch zu extrahieren.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!previewUrl && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
              <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <FileScan className="h-12 w-12 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Klicken zum Durchsuchen oder Drag & Drop</span>
                <Input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} ref={fileInputRef}/>
              </Label>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-4">
              <div className="relative w-full max-w-md mx-auto aspect-video border rounded-md overflow-hidden">
                <Image src={previewUrl} alt="Vorschau" layout="fill" objectFit="contain" data-ai-hint="receipt document" />
              </div>
              <div className="flex justify-center gap-2">
                <Button onClick={handleScanDocument} disabled={isLoading}>
                  {isLoading ? "Scannen..." : "Dokument scannen"}
                </Button>
                <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Anderes versuchen
                </Button>
              </div>
            </div>
          )}
          
          {error && <p className="text-sm text-destructive text-center">{error}</p>}

        </CardContent>
      </Card>

      {scannedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" /> Gescannte Informationen
            </CardTitle>
            <CardDescription>Überprüfen Sie die extrahierten Daten und korrigieren Sie sie bei Bedarf.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="merchant">Händler</Label>
              <Input id="merchant" defaultValue={scannedData.merchant} />
            </div>
            <div>
              <Label htmlFor="date">Datum</Label>
              <Input id="date" type="date" defaultValue={scannedData.date} />
            </div>
            <div>
              <Label htmlFor="amount">Betrag (€)</Label>
              <Input id="amount" type="number" step="0.01" defaultValue={scannedData.amount} />
            </div>
            <div>
              <Label htmlFor="category">Kategorie</Label>
              <Input id="category" defaultValue={scannedData.category} />
            </div>
            <div className="md:col-span-2 flex justify-end">
                <Button onClick={handleAddTransaction}>Zu Transaktionen hinzufügen</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
