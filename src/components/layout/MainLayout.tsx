// src/components/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
// import { LocationBanner } from '../common/LocationBanner';  // Removed – banner no longer needed
import { ScrollToTop } from '../common/ScrollToTop';
import { MobileBottomNav } from '../common/MobileBottomNav';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* <LocationBanner /> */}  {/* Banner removed */}
      <Header />
      <main className="flex-1 pb-14 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}