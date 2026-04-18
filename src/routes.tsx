// src/routes.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { MessageThread } from './components/chat/MessageThread';

// Lazy load pages
const Home = lazy(() => import('./pages/customer/Home'));
const Search = lazy(() => import('./pages/Search'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const CustomerProviderProfile = lazy(() => import('./pages/customer/ProviderProfile'));
const CustomerBookings = lazy(() => import('./pages/customer/Bookings'));
const CustomerMessages = lazy(() => import('./pages/customer/Messages'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const CustomerProfile = lazy(() => import('./pages/customer/Profile'));

const ProviderDashboard = lazy(() => import('./pages/provider/Dashboard'));
const ProviderSetup = lazy(() => import('./pages/provider/Setup'));
const ProviderPortfolio = lazy(() => import('./pages/provider/Portfolio'));
const ProviderBookings = lazy(() => import('./pages/provider/Bookings'));
const ProviderMessages = lazy(() => import('./pages/provider/Messages'));
const ProviderProfile = lazy(() => import('./pages/provider/Profile'));
const ProviderServices = lazy(() => import('./pages/provider/Services'));

const SignIn = lazy(() => import('./pages/auth/SignIn'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback'));

const Notifications = lazy(() => import('./pages/shared/Notifications'));
const Terms = lazy(() => import('./pages/shared/Terms'));
const Privacy = lazy(() => import('./pages/shared/Privacy'));
const Cookies = lazy(() => import('./pages/shared/Cookies'));
const Safety = lazy(() => import('./pages/shared/Safety'));
const Help = lazy(() => import('./pages/shared/Help'));
const Report = lazy(() => import('./pages/shared/Report'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Suspense fallback={<LoadingSkeleton />}><Home /></Suspense> },
      { path: 'search', element: <Suspense fallback={<LoadingSkeleton />}><Search /></Suspense> },
      { path: 'category/:tierSlug', element: <Suspense fallback={<LoadingSkeleton />}><CategoryPage /></Suspense> },
      { path: 'provider/:id', element: <Suspense fallback={<LoadingSkeleton />}><CustomerProviderProfile /></Suspense> },
      { path: 'terms', element: <Suspense fallback={<LoadingSkeleton />}><Terms /></Suspense> },
      { path: 'privacy', element: <Suspense fallback={<LoadingSkeleton />}><Privacy /></Suspense> },
      { path: 'cookies', element: <Suspense fallback={<LoadingSkeleton />}><Cookies /></Suspense> },
      { path: 'safety', element: <Suspense fallback={<LoadingSkeleton />}><Safety /></Suspense> },
      { path: 'help', element: <Suspense fallback={<LoadingSkeleton />}><Help /></Suspense> },
      { path: 'report', element: <Suspense fallback={<LoadingSkeleton />}><Report /></Suspense> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'signin', element: <Suspense fallback={<LoadingSkeleton />}><SignIn /></Suspense> },
      { path: 'signup', element: <Suspense fallback={<LoadingSkeleton />}><SignUp /></Suspense> },
      { path: 'reset-password', element: <Suspense fallback={<LoadingSkeleton />}><ResetPassword /></Suspense> },
      { path: 'callback', element: <Suspense fallback={<LoadingSkeleton />}><AuthCallback /></Suspense> },
    ],
  },
  {
    path: '/customer',
    element: (
      <ProtectedRoute allowedRoles={['customer']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Suspense fallback={<LoadingSkeleton />}><CustomerDashboard /></Suspense> },
      { path: 'bookings', element: <Suspense fallback={<LoadingSkeleton />}><CustomerBookings /></Suspense> },
      { path: 'messages', element: <Suspense fallback={<LoadingSkeleton />}><CustomerMessages /></Suspense> },
      { path: 'messages/:threadId', element: <Suspense fallback={<LoadingSkeleton />}><MessageThread /></Suspense> },
      { path: 'profile', element: <Suspense fallback={<LoadingSkeleton />}><CustomerProfile /></Suspense> },
      { path: 'notifications', element: <Suspense fallback={<LoadingSkeleton />}><Notifications /></Suspense> },
    ],
  },
  {
    path: '/provider',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Suspense fallback={<LoadingSkeleton />}><ProviderDashboard /></Suspense> },
      { path: 'setup', element: <Suspense fallback={<LoadingSkeleton />}><ProviderSetup /></Suspense> },
      { path: 'portfolio', element: <Suspense fallback={<LoadingSkeleton />}><ProviderPortfolio /></Suspense> },
      { path: 'services', element: <Suspense fallback={<LoadingSkeleton />}><ProviderServices /></Suspense> },
      { path: 'bookings', element: <Suspense fallback={<LoadingSkeleton />}><ProviderBookings /></Suspense> },
      { path: 'messages', element: <Suspense fallback={<LoadingSkeleton />}><ProviderMessages /></Suspense> },
      { path: 'messages/:threadId', element: <Suspense fallback={<LoadingSkeleton />}><MessageThread /></Suspense> },
      { path: 'profile', element: <Suspense fallback={<LoadingSkeleton />}><ProviderProfile /></Suspense> },
      { path: 'notifications', element: <Suspense fallback={<LoadingSkeleton />}><Notifications /></Suspense> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);