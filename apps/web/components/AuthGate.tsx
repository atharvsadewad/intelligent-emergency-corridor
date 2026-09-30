'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (pathname === '/login') { setReady(true); return; }
    const token = localStorage.getItem('corridor_token');
    if (!token) router.replace('/login');
    else setReady(true);
  }, [pathname, router]);
  if (!ready) return <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">Checking session...</div>;
  return <>{children}</>;
}
