
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Trash2 } from "lucide-react";
import { useAuditTrail, AuditLog } from "@/context/AuditTrailContext";
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useProfile } from '@/context/ProfileContext';

export default function AuditTrailPage() {
  const { auditLogs, clearAuditLogs } = useAuditTrail();
  const { activeProfile } = useProfile();
  const [profileFilter, setProfileFilter] = useState<"alle" | "Privat" | "Geschäftlich">(activeProfile);
  
  const filteredLogs = useMemo(() => {
    if (profileFilter === 'alle') {
        return auditLogs;
    }
    return auditLogs.filter(log => log.profile === profileFilter);
  }, [auditLogs, profileFilter]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd.MM.yyyy, HH:mm:ss", { locale: de });
    } catch (e) {
      return "Ungültiges Datum";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          Audit-Protokoll
        </h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Protokoll leeren
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Dadurch werden alle Protokolleinträge dauerhaft gelöscht.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={clearAuditLogs}>Protokoll leeren</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
            <Select value={profileFilter} onValueChange={(value) => setProfileFilter(value as any)}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Nach Profil filtern" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="alle">Alle Profile</SelectItem>
                    <SelectItem value="Privat">Nur Privat</SelectItem>
                    <SelectItem value="Geschäftlich">Nur Geschäftlich</SelectItem>
                </SelectContent>
            </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Protokollierte Aktionen</CardTitle>
          <CardDescription>Hier werden alle relevanten Änderungen und Aktionen in der Anwendung aufgezeichnet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeitstempel</TableHead>
                <TableHead>Profil</TableHead>
                <TableHead>Benutzer</TableHead>
                <TableHead>Aktion</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <TableRow key={log.id}>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{log.profile}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{log.details || 'N/A'}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Keine Protokolleinträge vorhanden.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
