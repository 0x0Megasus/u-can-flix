'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import LoadingBar from './LoadingBar';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isWatchPage = pathname?.startsWith('/watch/');

  return (
    <div className="relative min-h-screen flex flex-col">
      <LoadingBar />
      <Header />

      <main className="flex-1 pb-16">{children}</main>

      {!isWatchPage && <Footer />}
    </div>
  );
}
