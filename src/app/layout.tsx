import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppShell from '@/components/layout/AppShell';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ProfileProvider } from '@/context/ProfileContext';
import { AuditTrailProvider } from '@/context/AuditTrailContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Flow Finance',
  description: 'Verwalten Sie Ihre Finanzen einfach und übersichtlich.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head />
      <body className="font-body antialiased">
        <ProfileProvider>
          <AuditTrailProvider>
            <AppShell>
              {children}
            </AppShell>
            <Toaster />
          </AuditTrailProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
