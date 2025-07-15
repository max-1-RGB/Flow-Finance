
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { askFinBot, AskFinBotInput } from "@/ai/flows/financial-assistant"; 
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export default function FinBotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    const finBotInput: AskFinBotInput = { 
      question: newUserMessage.text, 
      // In einer echten App würden hier tatsächliche Finanzdaten des Benutzers übergeben werden.
      // Für dieses Beispiel verwenden wir einen leeren JSON-String oder spezifische Testdaten.
      financialData: JSON.stringify({
        einnahmen: [{quelle: "Gehalt", betrag: 3000, haeufigkeit: "monatlich"}],
        ausgaben: [
          {kategorie: "Miete", betrag: 1000, haeufigkeit: "monatlich"},
          {kategorie: "Lebensmittel", betrag: 400, haeufigkeit: "monatlich"},
          {kategorie: "Transport", betrag: 150, haeufigkeit: "monatlich"}
        ],
        kontostand: 5000 
      }) 
    }; 

    try {
      const response = await askFinBot(finBotInput);
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error("Error calling FinBot:", error);
      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
      toast({
        variant: "destructive",
        title: "FinBot Fehler",
        description: "Die Antwort vom FinBot konnte nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);


  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          FinBot Assistent
        </h1>
      </div>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Chatten Sie mit FinBot
          </CardTitle>
          <CardDescription>Stellen Sie Fragen zu Ihren Finanzen. Zum Beispiel: "Wie viel habe ich letzten Monat für Lebensmittel ausgegeben?"</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollAreaRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "justify-end" : ""
                }`}
              >
                {message.sender === "bot" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={18} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[70%] text-sm ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.text}
                </div>
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8">
                     <AvatarFallback>
                      <User size={18} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={18} />
                    </AvatarFallback>
                  </Avatar>
                <div className="rounded-lg p-3 bg-muted text-sm">
                  <span className="animate-pulse">FinBot tippt...</span>
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Geben Sie Ihre Frage ein..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || inputValue.trim() === ""}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Senden</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
