"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type ProfileType = 'Privat' | 'Geschäftlich';

interface ProfileContextType {
  activeProfile: ProfileType;
  setActiveProfile: (profile: ProfileType) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [activeProfile, setActiveProfile] = useState<ProfileType>('Privat');

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
