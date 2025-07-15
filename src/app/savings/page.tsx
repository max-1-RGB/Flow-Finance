
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Target, Edit, Trash2, History, CheckCircle, ShieldQuestion } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProfile, ProfileType } from "@/context/ProfileContext";
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAuditTrail } from '@/context/AuditTrailContext';

interface SavingsTransaction {
  date: string;
  amount: number;
  description: string;
}

interface PendingWithdrawal {
  id: string;
  amount: number; // will be negative
  reason: string;
  challenge: string;
  createdAt: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  targetDate: string;
  profile: ProfileType;
  history: SavingsTransaction[];
  pendingWithdrawals: PendingWithdrawal[];
}

const CHALLENGES_DATABASE = {
  easy: [
    "Mache einen 15-minütigen Spaziergang.",
    "Trinke heute 2 Liter Wasser.",
    "Lies 10 Seiten in einem Buch.",
    "Rufe einen Freund oder Verwandten an.",
    "Räume ein Zimmer in deiner Wohnung auf.",
  ],
  medium: [
    "Koche heute Abend ein gesundes Abendessen.",
    "Mache ein 30-minütiges Workout.",
    "Lerne 5 neue Vokabeln in einer Fremdsprache.",
    "Verzichte heute auf Social Media.",
    "Spende 5€ an eine gemeinnützige Organisation.",
  ],
  hard: [
    "Mache 100 Liegestütze über den Tag verteilt.",
    "Stehe eine Stunde früher auf als sonst.",
    "Verzichte eine Woche lang auf Zucker.",
    "Fange ein neues Hobby an und übe es für eine Stunde.",
    "Melde dich für einen Freiwilligendienst an.",
  ]
};

const initialSavingsGoals: SavingsGoal[] = [
  { id: "1", name: "Urlaub auf Hawaii", current: 2500, target: 5000, targetDate: "2025-12-31", profile: "Privat", history: [{ date: new Date().toISOString(), amount: 2500, description: "Ersteinzahlung" }], pendingWithdrawals: [] },
  { id: "2", name: "Neuer Laptop", current: 800, target: 1500, targetDate: "2024-11-30", profile: "Privat", history: [{ date: new Date().toISOString(), amount: 800, description: "Ersteinzahlung" }], pendingWithdrawals: [] },
  { id: "3", name: "Betriebliche Rücklagen", current: 7500, target: 20000, targetDate: "2026-06-30", profile: "Geschäftlich", history: [{ date: new Date().toISOString(), amount: 7500, description: "Ersteinzahlung" }], pendingWithdrawals: [] },
  { id: "4", name: "Anzahlung Geschäftsauto", current: 4500, target: 10000, targetDate: "2025-08-31", profile: "Geschäftlich", history: [{ date: new Date().toISOString(), amount: 4500, description: "Ersteinzahlung" }], pendingWithdrawals: [] },
];

export default function SavingsPage() {
  const [savingsGoals, setSavingsGoals] = useState(initialSavingsGoals);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isContributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setHistoryDialogOpen] = useState(false);
  const [isAutomationDialogOpen, setAutomationDialogOpen] = useState<null | 'round-up' | 'surplus'>(null);
  const [currentGoal, setCurrentGoal] = useState<SavingsGoal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [proposedChallenge, setProposedChallenge] = useState<string | null>(null);
  const [surplusPercentage, setSurplusPercentage] = useState([50]);
  const { toast } = useToast();
  const { activeProfile } = useProfile();
  const { addAuditLog } = useAuditTrail();

  const filteredGoals = useMemo(() => {
    return savingsGoals.filter(goal => goal.profile === activeProfile);
  }, [savingsGoals, activeProfile]);
  
  const pendingWithdrawals = useMemo(() => {
    return filteredGoals
      .flatMap(goal => goal.pendingWithdrawals.map(pw => ({ ...pw, goalName: goal.name, goalId: goal.id })))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [filteredGoals]);

  const handleCreateGoal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: name,
      target: parseFloat(formData.get('target') as string),
      targetDate: formData.get('targetDate') as string,
      current: 0,
      profile: activeProfile,
      history: [],
      pendingWithdrawals: [],
    };
    setSavingsGoals(prev => [...prev, newGoal]);
    addAuditLog({
        action: "Neues Sparziel erstellt",
        details: `Ziel: "${name}", Betrag: ${formatCurrency(newGoal.target)}`
    });
    setCreateDialogOpen(false);
    toast({ title: "Erfolg", description: "Neues Sparziel wurde erstellt." });
  };
  
  const handleEditGoal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentGoal) return;
    const formData = new FormData(event.currentTarget);
    const updatedName = formData.get('name') as string;
    const updatedTarget = parseFloat(formData.get('target') as string);
    const updatedGoal = {
      ...currentGoal,
      name: updatedName,
      target: updatedTarget,
      targetDate: formData.get('targetDate') as string,
    };
    setSavingsGoals(prev => prev.map(g => g.id === currentGoal.id ? updatedGoal : g));
    addAuditLog({
        action: "Sparziel bearbeitet",
        details: `Ziel "${currentGoal.name}" (ID: ${currentGoal.id}) geändert zu "${updatedName}", Betrag: ${formatCurrency(updatedTarget)}`
    });
    setEditDialogOpen(false);
    setCurrentGoal(null);
    toast({ title: "Erfolg", description: "Sparziel wurde aktualisiert." });
  };

  const handleDeleteGoal = (goal: SavingsGoal) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== goal.id));
    addAuditLog({
        action: "Sparziel gelöscht",
        details: `Ziel "${goal.name}" (ID: ${goal.id})`
    });
    toast({ title: "Erfolg", description: "Sparziel wurde gelöscht." });
  };
  
  const handleContributionAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setContributionAmount(value);
    
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount < 0) {
      const absAmount = Math.abs(amount);
      let difficulty: keyof typeof CHALLENGES_DATABASE;

      if (absAmount <= 50) {
        difficulty = 'easy';
      } else if (absAmount <= 200) {
        difficulty = 'medium';
      } else {
        difficulty = 'hard';
      }

      const challenges = CHALLENGES_DATABASE[difficulty];
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      setProposedChallenge(randomChallenge);
    } else {
      setProposedChallenge(null);
    }
  };

  const handleContribute = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentGoal) return;

    const amount = parseFloat(contributionAmount);

    if (isNaN(amount) || amount === 0) {
      toast({ variant: "destructive", title: "Ungültiger Betrag", description: "Bitte geben Sie einen gültigen, von Null verschiedenen Betrag ein." });
      return;
    }

    if (amount > 0) {
      // Handle deposit
      const newTransaction: SavingsTransaction = {
        date: new Date().toISOString(),
        amount: amount,
        description: 'Einzahlung',
      };
      const updatedGoal = {
        ...currentGoal,
        current: currentGoal.current + amount,
        history: [...currentGoal.history, newTransaction],
      };
      setSavingsGoals(prev => prev.map(g => g.id === currentGoal.id ? updatedGoal : g));
      addAuditLog({
        action: "Einzahlung auf Sparziel",
        details: `Betrag: ${formatCurrency(amount)} auf Ziel "${currentGoal.name}"`
      });
      toast({ title: "Erfolg", description: `Die Einzahlung von ${formatCurrency(amount)} wurde verbucht.` });
    } else {
      // Handle withdrawal request
      if (!withdrawalReason.trim()) {
        toast({ variant: "destructive", title: "Beschreibung erforderlich", description: "Für eine Entnahme ist eine Beschreibung zwingend erforderlich." });
        return;
      }
      if (!proposedChallenge) {
        toast({ variant: "destructive", title: "Fehler", description: "Es konnte keine Herausforderung generiert werden. Bitte versuchen Sie es erneut." });
        return;
      }

      const newPendingWithdrawal: PendingWithdrawal = {
        id: Date.now().toString(),
        amount: amount,
        reason: withdrawalReason,
        challenge: proposedChallenge,
        createdAt: new Date().toISOString(),
      };

      const updatedGoal = {
        ...currentGoal,
        pendingWithdrawals: [...currentGoal.pendingWithdrawals, newPendingWithdrawal],
      };

      setSavingsGoals(prev => prev.map(g => g.id === currentGoal.id ? updatedGoal : g));
      addAuditLog({
        action: "Auszahlung von Sparziel beantragt",
        details: `Betrag: ${formatCurrency(amount)} von Ziel "${currentGoal.name}"`
      });
      toast({ title: "Auszahlung beantragt", description: "Schließen Sie die Herausforderung ab, um die Auszahlung zu erhalten." });
    }

    setContributeDialogOpen(false);
    setCurrentGoal(null);
    setProposedChallenge(null);
    setContributionAmount('');
    setWithdrawalReason('');
  };
  
  const handleCompleteWithdrawal = (goalId: string, withdrawalId: string) => {
    setSavingsGoals(prevGoals => {
      const goalIndex = prevGoals.findIndex(g => g.id === goalId);
      if (goalIndex === -1) return prevGoals;

      const goal = prevGoals[goalIndex];
      const withdrawalIndex = goal.pendingWithdrawals.findIndex(pw => pw.id === withdrawalId);
      if (withdrawalIndex === -1) return prevGoals;

      const withdrawal = goal.pendingWithdrawals[withdrawalIndex];

      const newTransaction: SavingsTransaction = {
        date: new Date().toISOString(),
        amount: withdrawal.amount,
        description: withdrawal.reason,
      };

      const updatedGoal: SavingsGoal = {
        ...goal,
        current: goal.current + withdrawal.amount,
        history: [...goal.history, newTransaction],
        pendingWithdrawals: goal.pendingWithdrawals.filter(pw => pw.id !== withdrawalId),
      };

      const newGoals = [...prevGoals];
      newGoals[goalIndex] = updatedGoal;

      addAuditLog({
        action: "Auszahlung von Sparziel abgeschlossen",
        details: `Betrag: ${formatCurrency(withdrawal.amount)} von Ziel "${goal.name}"`
      });

      return newGoals;
    });

    toast({ title: "Herausforderung gemeistert!", description: "Die Auszahlung wurde erfolgreich verbucht." });
  };


  const openEditDialog = (goal: SavingsGoal) => {
    setCurrentGoal(goal);
    setEditDialogOpen(true);
  };
  
  const openContributeDialog = (goal: SavingsGoal) => {
    setCurrentGoal(goal);
    setContributionAmount('');
    setWithdrawalReason('');
    setProposedChallenge(null);
    setContributeDialogOpen(true);
  };
  
  const openHistoryDialog = (goal: SavingsGoal) => {
    setCurrentGoal(goal);
    setHistoryDialogOpen(true);
  };
  
  const handleAutomationSave = (type: 'round-up' | 'surplus') => {
    const actionText = type === 'round-up' ? 'Aufrundungssparen' : 'Überschussallokation';
    addAuditLog({
        action: `Spar-Automatisierung konfiguriert`,
        details: `Typ: ${actionText}`
    });
    toast({
      title: "Automatisierung gespeichert",
      description: `Ihre Einstellungen für "${actionText}" wurden gespeichert.`,
    });
    setAutomationDialogOpen(null);
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Sparziele ({activeProfile})
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Neues Ziel hinzufügen</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Neues Sparziel erstellen</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div><Label htmlFor="name">Zielname</Label><Input id="name" name="name" required /></div>
              <div><Label htmlFor="target">Zielbetrag (€)</Label><Input id="target" name="target" type="number" step="0.01" required /></div>
              <div><Label htmlFor="targetDate">Zieldatum</Label><Input id="targetDate" name="targetDate" type="date" required /></div>
              <DialogFooter><Button type="submit">Erstellen</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredGoals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline flex items-center">
                      <Target className="mr-2 h-5 w-5 text-primary" /> {goal.name}
                    </CardTitle>
                    <CardDescription>
                      Ziel: {formatCurrency(goal.target)} bis {formatDate(goal.targetDate)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Ziel bearbeiten" onClick={() => openEditDialog(goal)}>
                          <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Ziel löschen">
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                            <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteGoal(goal)}>Löschen</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={(goal.current / goal.target) * 100} className="h-3 mb-2" />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{formatCurrency(goal.current)}</span>
                  <span className="text-muted-foreground">{((goal.current / goal.target) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex gap-2 mt-4">
                    <Button variant="default" size="sm" className="w-full" onClick={() => openContributeDialog(goal)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Beitrag
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => openHistoryDialog(goal)}>
                      <History className="mr-2 h-4 w-4" /> Verlauf
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
            <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Für das Profil "{activeProfile}" wurden keine Sparziele gefunden. Erstellen Sie Ihr erstes Ziel!</p>
            </CardContent>
        </Card>
      )}


      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sparziel bearbeiten</DialogTitle></DialogHeader>
          {currentGoal && (
            <form onSubmit={handleEditGoal} className="space-y-4">
              <div><Label htmlFor="edit-name">Zielname</Label><Input id="edit-name" name="name" defaultValue={currentGoal.name} required /></div>
              <div><Label htmlFor="edit-target">Zielbetrag (€)</Label><Input id="edit-target" name="target" type="number" step="0.01" defaultValue={currentGoal.target} required /></div>
              <div><Label htmlFor="edit-targetDate">Zieldatum</Label><Input id="edit-targetDate" name="targetDate" type="date" defaultValue={currentGoal.targetDate} required /></div>
              <DialogFooter><Button type="submit">Speichern</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isContributeDialogOpen} onOpenChange={setContributeDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Beitrag leisten für "{currentGoal?.name}"</DialogTitle></DialogHeader>
          {currentGoal && (
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <Label htmlFor="amount">Betrag (€)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="Positiv für Einzahlung, negativ für Entnahme"
                  required
                  autoFocus
                  value={contributionAmount}
                  onChange={handleContributionAmountChange}
                />
              </div>
              {parseFloat(contributionAmount) < 0 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="withdrawal-reason">Grund der Entnahme (Pflichtfeld)</Label>
                    <Textarea
                      id="withdrawal-reason"
                      name="withdrawal-reason"
                      required
                      value={withdrawalReason}
                      onChange={(e) => setWithdrawalReason(e.target.value)}
                      placeholder="Wofür wird der Betrag verwendet?"
                    />
                  </div>
                  {proposedChallenge && (
                    <div className="space-y-2 rounded-md border border-dashed p-4">
                      <Label className="text-muted-foreground">Deine Herausforderung:</Label>
                      <p className="font-semibold text-primary">{proposedChallenge}</p>
                    </div>
                  )}
                </>
              )}
              <DialogFooter><Button type="submit">Beitrag verbuchen</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Transaktionsverlauf für "{currentGoal?.name}"</DialogTitle></DialogHeader>
          {currentGoal && (
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentGoal.history.length > 0 ? (
                    [...currentGoal.history].reverse().map((tx, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(tx.date)}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell className={`text-right ${tx.amount >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Kein Verlauf vorhanden.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {pendingWithdrawals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <ShieldQuestion className="mr-2 h-5 w-5 text-primary" /> Anstehende Auszahlungen & Herausforderungen
            </CardTitle>
            <CardDescription>
              Schließe diese Herausforderungen ab, um deine beantragten Auszahlungen zu erhalten.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingWithdrawals.map(pw => (
              <div key={pw.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50 gap-4">
                <div className="flex-1">
                  <p className="font-semibold">{pw.challenge}</p>
                  <p className="text-xs text-muted-foreground">
                    Für {formatCurrency(pw.amount)} aus "{pw.goalName}"
                  </p>
                </div>
                <Button size="sm" onClick={() => handleCompleteWithdrawal(pw.goalId, pw.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Abschließen & Abheben
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

       <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline">Ziel-Automatisierungen</CardTitle>
          <CardDescription>Richten Sie automatische Überweisungen zu Ihren Sparzielen ein.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Aufrundungssparen</h3>
            <p className="text-sm text-muted-foreground">Runden Sie Ihre Transaktionen automatisch auf den nächsten Euro auf und überweisen Sie die Differenz an ein ausgewähltes Ziel.</p>
            <Button variant="outline" className="mt-2" onClick={() => setAutomationDialogOpen('round-up')}>Aufrundungen konfigurieren</Button>
          </div>
          <div>
            <h3 className="font-semibold">Überschussallokation</h3>
            <p className="text-sm text-muted-foreground">Überweisen Sie am Monatsende automatisch einen Prozentsatz Ihres nicht ausgegebenen Budgets auf ein Sparziel.</p>
            <Button variant="outline" className="mt-2" onClick={() => setAutomationDialogOpen('surplus')}>Überschussallokation einrichten</Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Automation Dialogs */}
      <Dialog open={isAutomationDialogOpen === 'round-up'} onOpenChange={() => setAutomationDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aufrundungssparen konfigurieren</DialogTitle>
            <DialogDescription>Wählen Sie ein Sparziel aus, auf das die aufgerundeten Beträge überwiesen werden sollen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="round-up-goal">Sparziel für Aufrundungen</Label>
            <Select>
              <SelectTrigger id="round-up-goal">
                <SelectValue placeholder="Ziel auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {filteredGoals.map(goal => <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => handleAutomationSave('round-up')}>Automatisierung speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAutomationDialogOpen === 'surplus'} onOpenChange={() => setAutomationDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Überschussallokation einrichten</DialogTitle>
            <DialogDescription>Stellen Sie ein, wie viel Prozent Ihres monatlichen Budget-Überschusses automatisch gespart werden sollen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="surplus-goal">Sparziel für Überschuss</Label>
              <Select>
                <SelectTrigger id="surplus-goal">
                  <SelectValue placeholder="Ziel auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredGoals.map(goal => <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Prozentsatz des Überschusses</Label>
                <span className="text-primary font-semibold">{surplusPercentage[0]}%</span>
              </div>
              <Slider
                defaultValue={[50]}
                max={100}
                step={5}
                onValueChange={setSurplusPercentage}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleAutomationSave('surplus')}>Automatisierung speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
