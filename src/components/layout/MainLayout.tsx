// src/components/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { LocationBanner } from '../common/LocationBanner';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <LocationBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}