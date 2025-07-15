
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, FileText, Printer } from "lucide-react";
import { generateContract, GenerateContractInput, GenerateContractOutput } from '@/ai/flows/contract-generator';
import { useParams } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import Logo from '@/components/icons/Logo';

const formSchema = z.object({
    companyName: z.string().min(1, "Firmenname ist erforderlich."),
    companyAddress: z.string().min(1, "Firmenadresse ist erforderlich."),
    employmentType: z.enum(["Festanstellung", "Teilzeit", "Freelancer", "Praktikant"]),
    salary: z.coerce.number().min(0, "Gehalt muss ein positiver Wert sein."),
    salaryType: z.enum(["Monatlich", "Stündlich"]),
    startDate: z.string().min(1, "Startdatum ist erforderlich."),
    endDate: z.string().optional(),
    weeklyHours: z.coerce.number().optional(),
    vacationDays: z.coerce.number().optional(),
    probationPeriodMonths: z.coerce.number().optional(),
    customClauses: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PersonData {
    id: string;
    name: string;
    position: string;
    address?: string;
    hireDate?: string;
    isApplicant?: boolean;
    employmentType?: "Festanstellung" | "Teilzeit" | "Freelancer" | "Praktikant";
    salary?: number;
    salaryType?: "Monatlich" | "Stündlich";
    weeklyHours?: number;
}

// Mock data fetching. In a real app, this would fetch from a database.
const initialPersonnel = [
  { id: "1", name: "Anna Schmidt", position: "Videografin", email: "anna.s@example.com", hireDate: "2023-08-15", employmentType: "Festanstellung", salary: 4200, salaryType: "Monatlich", weeklyHours: 40, address: "Musterweg 1, 12345 Musterstadt" },
  { id: "2", name: "Ben Weber", position: "Editor (Freelancer)", email: "ben.weber@freelance.de", hireDate: "2024-01-10", employmentType: "Freelancer", salary: 75, salaryType: "Stündlich", weeklyHours: 20, address: "Beispielallee 22, 54321 Beispielhausen" },
];


export default function CreateContractPage() {
  const params = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [contractResult, setContractResult] = useState<GenerateContractOutput | null>(null);
  const [person, setPerson] = useState<PersonData | null>(null);
  const { toast } = useToast();
  const contractPrintRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => contractPrintRef.current,
    documentTitle: `Vertrag_${person?.name.replace(' ', '_') || 'Entwurf'}`,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      employmentType: "Festanstellung",
      salary: 4000,
      salaryType: "Monatlich",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      weeklyHours: 40,
      vacationDays: 28,
      probationPeriodMonths: 6,
      customClauses: "Überstunden sind mit dem Gehalt abgegolten.\nDie ersten 6 Monate gelten als Probezeit.",
    },
  });
  
  useEffect(() => {
    // Load company info from localStorage
    const companyInfo = localStorage.getItem('companyInfo');
    if (companyInfo) {
        const { name, address } = JSON.parse(companyInfo);
        form.setValue('companyName', name || '');
        form.setValue('companyAddress', address || '');
    }

    const personnelId = params.id;
    let foundPerson: PersonData | null = null;
    
    // Check localStorage first for applicant data
    const applicantDataString = localStorage.getItem('personnelForContract');
    if (applicantDataString) {
        try {
            const applicantData = JSON.parse(applicantDataString);
            if (applicantData.id === personnelId) {
                foundPerson = applicantData;
                localStorage.removeItem('personnelForContract'); // Clean up
            }
        } catch (e) {
            console.error("Could not parse applicant data", e);
        }
    }
    
    // If not found in localStorage, check the initialPersonnel mock data
    if (!foundPerson) {
        foundPerson = initialPersonnel.find(p => p.id === personnelId) || null;
    }

    setPerson(foundPerson);

    if (foundPerson) {
      if (foundPerson.hireDate) {
        form.setValue('startDate', new Date(foundPerson.hireDate).toISOString().split('T')[0]);
      }
      
      const p = initialPersonnel.find(p => p.id === foundPerson?.id);
      if(p) {
         form.setValue('employmentType', p.employmentType as FormValues['employmentType']);
         form.setValue('salaryType', p.salaryType as FormValues['salaryType']);
         if(p.salary) form.setValue('salary', p.salary);
         if(p.weeklyHours) form.setValue('weeklyHours', p.weeklyHours);
      }
    }
  }, [params.id, form]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!person) return;
    setIsLoading(true);
    setContractResult(null);

    const inputForAI: GenerateContractInput = {
        ...data,
        personnelName: person.name,
        personnelAddress: person.address || 'Keine Adresse hinterlegt',
        position: person.position,
    };
    
    try {
      const result = await generateContract(inputForAI);
      setContractResult(result);
    } catch (error: any) {
      console.error("Fehler beim Erstellen des Vertrags:", error);
      const errorMessage = error.message || "Unbekannter Fehler";
      if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("overloaded")) {
         toast({ 
            variant: "destructive", 
            title: "KI-Modell überlastet", 
            description: "Der KI-Dienst ist zurzeit nicht verfügbar. Bitte versuchen Sie es später erneut."
        });
      } else {
         toast({ 
            variant: "destructive", 
            title: "Fehler", 
            description: "Der Vertragsentwurf konnte nicht erstellt werden."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!person) {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="font-headline text-3xl font-semibold tracking-tight">
              Vertragserstellung
            </h1>
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Lade Personaldaten...</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight">
        Vertragserstellung für: <span className="text-primary">{person.name}</span>
      </h1>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Vertragsdetails</CardTitle>
            <CardDescription>Füllen Sie die Felder aus, um einen KI-basierten Vertragsentwurf zu erhalten.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="companyName" render={({ field }) => (
                    <FormItem><FormLabel>Ihr Firmenname</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="companyAddress" render={({ field }) => (
                    <FormItem><FormLabel>Ihre Firmenadresse</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="employmentType" render={({ field }) => (
                    <FormItem><FormLabel>Anstellungsart</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Festanstellung">Festanstellung</SelectItem>
                            <SelectItem value="Teilzeit">Teilzeit</SelectItem>
                            <SelectItem value="Freelancer">Freelancer</SelectItem>
                            <SelectItem value="Praktikant">Praktikant</SelectItem>
                        </SelectContent>
                    </Select></FormControl><FormMessage /></FormItem>
                )}/>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="salary" render={({ field }) => (
                        <FormItem><FormLabel>Gehalt / Satz</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="salaryType" render={({ field }) => (
                        <FormItem><FormLabel>Gehaltsart</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}>
                             <SelectTrigger><SelectValue/></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="Monatlich">Monatlich</SelectItem>
                                <SelectItem value="Stündlich">Stündlich</SelectItem>
                             </SelectContent>
                        </Select></FormControl><FormMessage /></FormItem>
                    )}/>
                 </div>
                <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem><FormLabel>Vertragsbeginn</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem><FormLabel>Vertragsende (optional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="weeklyHours" render={({ field }) => (
                    <FormItem><FormLabel>Wochenstunden</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="vacationDays" render={({ field }) => (
                    <FormItem><FormLabel>Urlaubstage pro Jahr</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="probationPeriodMonths" render={({ field }) => (
                    <FormItem><FormLabel>Probezeit in Monaten</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="customClauses" render={({ field }) => (
                    <FormItem><FormLabel>Zusätzliche Klauseln</FormLabel><FormControl><Textarea placeholder="z.B. Regelungen zur Vertraulichkeit, zum Equipment..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generiere...</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Vertragsentwurf erstellen</>)}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="sticky top-24">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Vertragsentwurf</CardTitle>
              <Button variant="outline" size="sm" onClick={handlePrint} disabled={!contractResult}>
                <Printer className="mr-2 h-4 w-4" /> Als PDF exportieren
              </Button>
            </div>
            <CardDescription>Das Ergebnis wird hier angezeigt. Sie können es kopieren oder als PDF exportieren.</CardDescription>
          </CardHeader>
          <CardContent className="bg-muted/50 max-h-[calc(100vh-18rem)] overflow-y-auto">
             <div ref={contractPrintRef} className="bg-white text-black p-8 prose prose-sm max-w-none print:shadow-none print:p-0 print:bg-transparent print:text-black">
                {isLoading ? (
                    <div className="space-y-2 animate-pulse"><div className="h-4 w-3/4 rounded bg-slate-200"></div><div className="h-4 w-full rounded bg-slate-200"></div><div className="h-4 w-5/6 rounded bg-slate-200"></div></div>
                ) : !contractResult ? (
                    <div className="text-center text-slate-500 py-12"><p>Ihr generierter Vertragsentwurf erscheint hier.</p></div>
                ) : (
                    <div className="flex flex-col h-[29.7cm] min-h-[29.7cm] w-full">
                        <header className="flex justify-between items-start pb-8 border-b">
                            <div>
                                <h2 className="text-2xl font-bold">{form.getValues('companyName')}</h2>
                                <p className="text-xs whitespace-pre-wrap">{form.getValues('companyAddress')}</p>
                            </div>
                            <Logo className="h-16 w-16" />
                        </header>
                        <main className="flex-grow py-8">
                             <pre className="whitespace-pre-wrap font-sans text-sm bg-transparent p-0">{contractResult.contractMarkdown}</pre>
                        </main>
                        <footer className="text-xs text-slate-500 pt-4 border-t text-center">
                            <p>{form.getValues('companyName')} | {form.getValues('companyAddress').split('\n')[0]}</p>
                        </footer>
                    </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
