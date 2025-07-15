
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, AlertTriangle, Edit, Trash2, PieChart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProfile, ProfileType } from "@/context/ProfileContext";
import { useAuditTrail } from "@/context/AuditTrailContext";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer } from "recharts";


interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  profile: ProfileType;
}

const PIE_CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#a3e635",
  "#fbbf24",
];


const initialBudgets: Budget[] = [
  { id: "1", category: "Lebensmittel", spent: 350, limit: 500, profile: "Privat" },
  { id: "2", category: "Unterhaltung", spent: 180, limit: 200, profile: "Privat" },
  { id: "3", category: "Transport", spent: 90, limit: 150, profile: "Privat" },
  { id: "4", category: "Marketing", spent: 850, limit: 1200, profile: "Geschäftlich" },
  { id: "5", category: "Software", spent: 250, limit: 400, profile: "Geschäftlich" },
  { id: "6", category: "Büromaterial", spent: 120, limit: 200, profile: "Geschäftlich" },
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const { toast } = useToast();
  const { activeProfile } = useProfile();
  const { addAuditLog } = useAuditTrail();

  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => b.profile === activeProfile);
  }, [budgets, activeProfile]);
  
  const spentByCategoryChartData = useMemo(() => {
    return filteredBudgets
      .filter(b => b.spent > 0)
      .map((b, index) => ({
        category: b.category,
        value: b.spent,
        fill: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredBudgets]);

  const chartConfigCategory = useMemo(() => {
    const config: any = { value: { label: "Ausgaben" } };
    spentByCategoryChartData.forEach(item => {
        config[item.category] = {
            label: item.category,
            color: item.fill,
        };
    });
    return config;
  }, [spentByCategoryChartData]);


  const handleCreateBudget = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = formData.get('category') as string;
    const newBudget: Budget = {
      id: Date.now().toString(),
      category: category,
      limit: parseFloat(formData.get('limit') as string),
      spent: 0,
      profile: activeProfile,
    };
    setBudgets(prev => [...prev, newBudget]);
    addAuditLog({
      action: "Neues Budget erstellt",
      details: `Kategorie: ${category}, Limit: ${formatCurrency(newBudget.limit)}`
    });
    setCreateDialogOpen(false);
    toast({ title: "Erfolg", description: "Budget wurde erstellt." });
  };

  const handleEditBudget = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentBudget) return;
    const formData = new FormData(event.currentTarget);
    const updatedCategory = formData.get('category') as string;
    const updatedLimit = parseFloat(formData.get('limit') as string);
    const updatedBudget = {
      ...currentBudget,
      category: updatedCategory,
      limit: updatedLimit,
    };
    setBudgets(prev => prev.map(b => b.id === currentBudget.id ? updatedBudget : b));
    addAuditLog({
      action: "Budget bearbeitet",
      details: `Budget "${currentBudget.category}" (ID: ${currentBudget.id}) geändert zu "${updatedCategory}", Limit: ${formatCurrency(updatedLimit)}`
    });
    setEditDialogOpen(false);
    setCurrentBudget(null);
    toast({ title: "Erfolg", description: "Budget wurde aktualisiert." });
  };
  
  const handleDeleteBudget = (budget: Budget) => {
    setBudgets(prev => prev.filter(b => b.id !== budget.id));
    addAuditLog({
        action: "Budget gelöscht",
        details: `Budget "${budget.category}" (ID: ${budget.id})`
    });
    toast({ title: "Erfolg", description: "Budget wurde gelöscht." });
  };
  
  const openEditDialog = (budget: Budget) => {
    setCurrentBudget(budget);
    setEditDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const totalBudgeted = filteredBudgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remaining = totalBudgeted - totalSpent;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Monatliche Budgets ({activeProfile})
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Neues Budget erstellen</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Budget erstellen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Input id="category" name="category" required />
              </div>
              <div>
                <Label htmlFor="limit">Budget-Limit (€)</Label>
                <Input id="limit" name="limit" type="number" step="0.01" required />
              </div>
              <DialogFooter>
                <Button type="submit">Erstellen</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
       <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center">
                    <PieChart className="mr-2 h-5 w-5 text-primary" /> Ausgabenverteilung
                </CardTitle>
                <CardDescription>Visualisierung Ihrer Ausgaben nach Budgetkategorie.</CardDescription>
            </CardHeader>
            <CardContent>
                {spentByCategoryChartData.length > 0 ? (
                    <ChartContainer config={chartConfigCategory} className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height={250}>
                            <RechartsPieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="category" formatter={(value) => formatCurrency(value as number)} />} />
                                <Pie data={spentByCategoryChartData} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={80} labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                                    {spentByCategoryChartData.map((entry) => (
                                        <Cell key={`cell-${entry.category}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        Keine Ausgabendaten vorhanden.
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Budgetübersicht</CardTitle>
                <CardDescription>Gesamtstatus Ihrer monatlichen Budgets.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-center h-[250px] space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">Budgetiert Gesamt</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Ausgegeben Gesamt</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Verbleibend</p>
                    <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatCurrency(remaining)}</p>
                </div>
            </CardContent>
        </Card>
      </div>

      {filteredBudgets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBudgets.map((budget) => (
            <Card key={budget.id} className={`${budget.spent / budget.limit >= 1 ? 'border-destructive' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-headline">{budget.category}</CardTitle>
                  {budget.spent / budget.limit > 0.9 && <AlertTriangle className="h-5 w-5 text-destructive" />}
                </div>
                <CardDescription>
                  Ausgegeben: {formatCurrency(budget.spent)} / Limit: {formatCurrency(budget.limit)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={(budget.spent / budget.limit) * 100} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {((budget.spent / budget.limit) * 100).toFixed(0)}% genutzt
                  {budget.spent > budget.limit && <span className="text-destructive font-semibold"> - Budget überschritten!</span>}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(budget)}>
                    <Edit className="mr-2 h-4 w-4" /> Bearbeiten
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Löschen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird das Budget dauerhaft gelöscht.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBudget(budget)}>Löschen</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Für das Profil "{activeProfile}" wurden keine Budgets gefunden. Erstellen Sie Ihr erstes Budget!</p>
          </CardContent>
        </Card>
      )}


      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Budget bearbeiten</DialogTitle>
          </DialogHeader>
          {currentBudget && (
            <form onSubmit={handleEditBudget} className="space-y-4">
              <div>
                <Label htmlFor="edit-category">Kategorie</Label>
                <Input id="edit-category" name="category" defaultValue={currentBudget.category} required />
              </div>
              <div>
                <Label htmlFor="edit-limit">Budget-Limit (€)</Label>
                <Input id="edit-limit" name="limit" type="number" step="0.01" defaultValue={currentBudget.limit} required />
              </div>
              <DialogFooter>
                <Button type="submit">Speichern</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
