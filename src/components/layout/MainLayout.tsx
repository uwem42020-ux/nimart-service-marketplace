// src/components/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { MobileBottomNav } from '../common/MobileBottomNav';
import { ScrollToTop } from '../common/ScrollToTop';   // ← NEW import

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />   {/* ← NEW: resets scroll position on every route change */}
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}