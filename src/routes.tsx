// src/routes.tsx (or wherever your createBrowserRouter is defined)
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { ProviderProfileSkeleton } from './components/skeletons/ProviderProfileSkeleton';
import { ProviderPortfolioSkeleton } from './components/skeletons/ProviderPortfolioSkeleton';
import { MessageThread } from './components/chat/MessageThread';

// Lazy load pages
const Home = lazy(() => import('./pages/customer/Home'));
const Search = lazy(() => import('./pages/Search'));
const MapPage = lazy(() => import('./pages/MapPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ServiceLocationPage = lazy(() => import('./pages/ServiceLocationPage'));
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
const ProviderVerification = lazy(() => import('./pages/provider/Verification'));
const ProviderPayment = lazy(() => import('./pages/provider/Payment'));

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
const NimartVsNimart = lazy(() => import('./pages/shared/NimartVsNimart'));
const NimartExplained = lazy(() => import('./pages/shared/NimartExplained')); // <-- NEW
const Careers = lazy(() => import('./pages/shared/Careers'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BookingReceipt = lazy(() => import('./pages/shared/BookingReceipt'));
const NotFound = lazy(() => import('./pages/shared/NotFound'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminChats = lazy(() => import('./pages/admin/Chats'));
const AdminBulkEmail = lazy(() => import('./pages/admin/BulkEmail'));
const AdminVerifications = lazy(() => import('./pages/admin/Verifications'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminCoins = lazy(() => import('./pages/admin/Coins'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminBlog = lazy(() => import('./pages/admin/Blog'));
const AdminFlags = lazy(() => import('./pages/admin/Flags'));
const AdminReferrals = lazy(() => import('./pages/admin/Referrals'));

// Provider portfolio page (customer view)
const CustomerProviderPortfolio = lazy(() => import('./pages/customer/ProviderPortfolio'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Suspense fallback={<LoadingSkeleton />}><Home /></Suspense> },
      { path: 'search', element: <Suspense fallback={<LoadingSkeleton />}><Search /></Suspense> },
      { path: 'map', element: <Suspense fallback={<LoadingSkeleton />}><MapPage /></Suspense> },
      { path: 'category/:tierSlug', element: <Suspense fallback={<LoadingSkeleton />}><CategoryPage /></Suspense> },
      { path: 'services/:categorySlug/in/:lgaId', element: <Suspense fallback={<LoadingSkeleton />}><ServiceLocationPage /></Suspense> },
      {
        path: 'provider/:id',
        element: (
          <Suspense fallback={<ProviderProfileSkeleton />}>
            <CustomerProviderProfile />
          </Suspense>
        ),
      },
      {
        path: 'provider/:id/portfolio',
        element: (
          <Suspense fallback={<ProviderPortfolioSkeleton />}>
            <CustomerProviderPortfolio />
          </Suspense>
        ),
      },
      { path: 'blog', element: <Suspense fallback={<LoadingSkeleton />}><Blog /></Suspense> },
      { path: 'blog/:slug', element: <Suspense fallback={<LoadingSkeleton />}><BlogPost /></Suspense> },
      { path: 'careers', element: <Suspense fallback={<LoadingSkeleton />}><Careers /></Suspense> },
      { path: 'receipt/:token', element: <Suspense fallback={<LoadingSkeleton />}><BookingReceipt /></Suspense> },
      { path: 'terms', element: <Suspense fallback={<LoadingSkeleton />}><Terms /></Suspense> },
      { path: 'privacy', element: <Suspense fallback={<LoadingSkeleton />}><Privacy /></Suspense> },
      { path: 'cookies', element: <Suspense fallback={<LoadingSkeleton />}><Cookies /></Suspense> },
      { path: 'safety', element: <Suspense fallback={<LoadingSkeleton />}><Safety /></Suspense> },
      { path: 'help', element: <Suspense fallback={<LoadingSkeleton />}><Help /></Suspense> },
      { path: 'report', element: <Suspense fallback={<LoadingSkeleton />}><Report /></Suspense> },
      { path: 'nimart-vs-nimart', element: <Suspense fallback={<LoadingSkeleton />}><NimartVsNimart /></Suspense> },
      { path: 'nimart-explained', element: <Suspense fallback={<LoadingSkeleton />}><NimartExplained /></Suspense> },  // <-- NEW ROUTE
      { path: '*', element: <Suspense fallback={<LoadingSkeleton />}><NotFound /></Suspense> },
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
      { path: 'verification', element: <Suspense fallback={<LoadingSkeleton />}><ProviderVerification /></Suspense> },
      { path: 'payment', element: <Suspense fallback={<LoadingSkeleton />}><ProviderPayment /></Suspense> },
      { path: 'notifications', element: <Suspense fallback={<LoadingSkeleton />}><Notifications /></Suspense> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <DashboardLayout />
      </AdminRoute>
    ),
    children: [
      { path: 'dashboard', element: <Suspense fallback={<LoadingSkeleton />}><AdminDashboard /></Suspense> },
      { path: 'users', element: <Suspense fallback={<LoadingSkeleton />}><AdminUsers /></Suspense> },
      { path: 'chats', element: <Suspense fallback={<LoadingSkeleton />}><AdminChats /></Suspense> },
      { path: 'email', element: <Suspense fallback={<LoadingSkeleton />}><AdminBulkEmail /></Suspense> },
      { path: 'verifications', element: <Suspense fallback={<LoadingSkeleton />}><AdminVerifications /></Suspense> },
      { path: 'reports', element: <Suspense fallback={<LoadingSkeleton />}><AdminReports /></Suspense> },
      { path: 'coins', element: <Suspense fallback={<LoadingSkeleton />}><AdminCoins /></Suspense> },
      { path: 'payments', element: <Suspense fallback={<LoadingSkeleton />}><AdminPayments /></Suspense> },
      { path: 'blog', element: <Suspense fallback={<LoadingSkeleton />}><AdminBlog /></Suspense> },
      { path: 'flags', element: <Suspense fallback={<LoadingSkeleton />}><AdminFlags /></Suspense> },
      { path: 'referrals', element: <Suspense fallback={<LoadingSkeleton />}><AdminReferrals /></Suspense> },
    ],
  },
]);