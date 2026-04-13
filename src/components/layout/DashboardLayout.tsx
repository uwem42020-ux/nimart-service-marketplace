// src/components/layout/DashboardLayout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
}