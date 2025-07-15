
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Idea {
  id: string;
  text: string;
}

export default function IdeaDumpPage() {
  const [ideas, setIdeas] = useState<Idea[]>([
    { id: "1", text: "Video über die 5 besten Kamera-Hacks für Anfänger" },
    { id: "2", text: "Ein Reel, das meinen Tagesablauf im Schnelldurchlauf zeigt" },
    { id: "3", text: "Podcast-Interview mit einem anderen Creator aus der Nische" },
  ]);
  const [newIdeaText, setNewIdeaText] = useState("");
  const { toast } = useToast();

  const handleAddIdea = (event: React.FormEvent) => {
    event.preventDefault();
    if (newIdeaText.trim() === "") {
      toast({
        variant: "destructive",
        title: "Leere Idee",
        description: "Bitte geben Sie einen Text für Ihre Idee ein.",
      });
      return;
    }
    const newIdea: Idea = {
      id: Date.now().toString(),
      text: newIdeaText.trim(),
    };
    setIdeas(prev => [newIdea, ...prev]);
    setNewIdeaText("");
    toast({ title: "Idee gespeichert!" });
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
    toast({ title: "Idee gelöscht" });
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold tracking-tight">
        Ideensammlung
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Neue Idee schnell festhalten</CardTitle>
          <CardDescription>Keine Idee geht mehr verloren. Einfach eintippen und speichern.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddIdea} className="flex gap-2">
            <Input
              value={newIdeaText}
              onChange={(e) => setNewIdeaText(e.target.value)}
              placeholder="Was ist Ihre nächste große Idee?"
            />
            <Button type="submit" size="icon">
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only">Idee hinzufügen</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-headline text-2xl font-semibold tracking-tight">Ihre Ideen</h2>
        {ideas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <Card key={idea.id} className="flex flex-col">
                <CardContent className="p-4 flex-grow flex items-center">
                  <p className="text-sm">{idea.text}</p>
                </CardContent>
                <div className="border-t p-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteIdea(idea.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Idee löschen</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Hier ist Platz für Ihre genialen Einfälle!</p>
          </div>
        )}
      </div>
    </div>
  );
}
