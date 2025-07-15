
"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useProfile, ProfileType } from './ProfileContext';

export interface AuditLog {
  id: string;
  timestamp: string;
  profile: ProfileType;
  user: string; // For now, a simple string. Could be an object later.
  action: string;
  details?: string;
}

interface AuditTrailContextType {
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp' | 'profile' | 'user'>) => void;
  clearAuditLogs: () => void;
}

const AuditTrailContext = createContext<AuditTrailContextType | undefined>(undefined);

export const AuditTrailProvider = ({ children }: { children: ReactNode }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const { activeProfile } = useProfile();

  const addAuditLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp' | 'profile' | 'user'>) => {
    const newLog: AuditLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      profile: activeProfile,
      user: 'Max Mustermann', // Static user for this prototype
    };
    setAuditLogs(prevLogs => [newLog, ...prevLogs]);
  }, [activeProfile]);

  const clearAuditLogs = () => {
    setAuditLogs([]);
    addAuditLog({ action: "Audit-Protokoll geleert" });
  };

  return (
    <AuditTrailContext.Provider value={{ auditLogs, addAuditLog, clearAuditLogs }}>
      {children}
    </AuditTrailContext.Provider>
  );
};

export const useAuditTrail = (): AuditTrailContextType => {
  const context = useContext(AuditTrailContext);
  if (context === undefined) {
    throw new Error('useAuditTrail must be used within an AuditTrailProvider');
  }
  return context;
};
