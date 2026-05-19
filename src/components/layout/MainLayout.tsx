// src/components/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { MobileBottomNav } from '../common/MobileBottomNav';

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}