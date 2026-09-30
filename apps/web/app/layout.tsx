import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { AuthGate } from '@/components/AuthGate';

export const metadata: Metadata = {
  title: 'Intelligent Emergency Corridor Management System',
  description: 'Real-time GPS emergency vehicle coordination and traffic officer green corridor management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50">
        <AuthGate>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
          <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          Intelligent Emergency Corridor Management System &copy; {new Date().getFullYear()} — College PBL Prototype
        </footer>
        </AuthGate>
      </body>
    </html>
  );
}
