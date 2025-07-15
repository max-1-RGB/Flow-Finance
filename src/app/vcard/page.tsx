
"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { QrCode, Download } from "lucide-react";
import { QRCodeCanvas } from 'qrcode.react';

const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  company: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional(),
  website: z.string().url("Ungültige URL").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function VCardPage() {
  const [qrValue, setQrValue] = useState("");
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Max Mustermann",
      company: "Content Creations",
      title: "Content Creator",
      phone: "+49123456789",
      email: "max.mustermann@content.de",
      website: "https://mein-portfolio.de",
    },
  });

  const generateVCardString = (data: FormValues) => {
    let vCard = "BEGIN:VCARD\n";
    vCard += "VERSION:3.0\n";
    vCard += `FN:${data.name}\n`;
    if (data.company) vCard += `ORG:${data.company}\n`;
    if (data.title) vCard += `TITLE:${data.title}\n`;
    if (data.phone) vCard += `TEL;TYPE=WORK,VOICE:${data.phone}\n`;
    if (data.email) vCard += `EMAIL:${data.email}\n`;
    if (data.website) vCard += `URL:${data.website}\n`;
    vCard += "END:VCARD";
    return vCard;
  };
  
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const vCardString = generateVCardString(data);
    setQrValue(vCardString);
  };
  
  // Generate initial QR code on mount
  React.useEffect(() => {
    onSubmit(form.getValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = () => {
    if (qrCodeRef.current) {
        const canvas = qrCodeRef.current.querySelector('canvas');
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = "visitenkarte-qr-code.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight">
        Digitale Visitenkarte (QR-Code)
      </h1>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Ihre Kontaktdaten</CardTitle>
            <CardDescription>Füllen Sie die Felder aus, um Ihren persönlichen vCard QR-Code zu erstellen.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onChange={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="company" render={({ field }) => (
                  <FormItem><FormLabel>Firma</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Position/Titel</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Telefon</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>E-Mail</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="website" render={({ field }) => (
                  <FormItem><FormLabel>Webseite</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-primary"/> Ihr QR-Code</CardTitle>
            <CardDescription>Bereit zum Scannen. Speichern Sie ihn für Ihre digitalen oder gedruckten Materialien.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-6">
            <div ref={qrCodeRef} className="p-4 bg-white rounded-lg border">
              {qrValue ? (
                <QRCodeCanvas 
                    value={qrValue} 
                    size={256}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"L"}
                    includeMargin={false}
                />
              ) : (
                <div className="w-[256px] h-[256px] bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    Bitte geben Sie Daten ein.
                </div>
              )}
            </div>
            <Button onClick={handleDownload} disabled={!qrValue}>
                <Download className="mr-2 h-4 w-4" /> Als PNG herunterladen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
