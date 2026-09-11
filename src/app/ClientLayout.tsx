'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { BackToTop } from '@/components/BackToTop';
import { LoginDialog } from '@/components/LoginDialog';
import { LoginDialogProvider } from '@/components/LoginDialogContext';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-[#1e2d3d]" />,
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login');

  useEffect(() => {
    const addDNSPrefetch = (domain: string) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    };
    addDNSPrefetch('https://urest.in');
    addDNSPrefetch('https://www.royalnestgroup.com');
    addDNSPrefetch('https://www.firmity.in');
    addDNSPrefetch('https://account.ufirm.in');

    const preloadImage = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
    };
    preloadImage('/Assets/carousel_1.webp');
    preloadImage('/Assets/ufirmlogo.svg');
  }, []);

  return (
    <LoginDialogProvider>
      {!isAuthPage && <NavBar />}
      {!isAuthPage && <LoginDialog />}
      {children}
      {!isAuthPage && <Footer />}
      {!isAuthPage && <BackToTop />}
    </LoginDialogProvider>
  );
}