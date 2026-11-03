import { createBrowserRouter, Navigate, useParams } from 'react-router';
import PlatformShell from '@/components/PlatformShell';
import RequireAuth from '@/components/RequireAuth';
import AdminHospitalDetailPage from '@/routes/admin/hospitals/detail/page';
import AdminHospitalsPage from '@/routes/admin/hospitals/page';
import AdminLayout from '@/routes/admin/layout';
import AdminOverviewPage from '@/routes/admin/page';
import AdminRecordsPage from '@/routes/admin/records/page';
import AdminUserDetailPage from '@/routes/admin/users/detail/page';
import AdminUsersPage from '@/routes/admin/users/page';
import AboutLayout from '@/routes/about/layout';
import AboutPage from '@/routes/about/page';
import AuthLayout from '@/routes/auth/layout';
import LoginPage from '@/routes/auth/login/page';
import HospitalSignupPage from '@/routes/auth/signup/hospital/page';
import SignupPage from '@/routes/auth/signup/page';
import RouteErrorPage from '@/routes/error/page';
import HomePage from '@/routes/home/page';
import RootLayout from '@/routes/layout';
import AiUsePolicyPage from '@/routes/legal/ai-use-policy/page';
import CookiePolicyPage from '@/routes/legal/cookie-policy/page';
import LegalLayout from '@/routes/legal/layout';
import MedicalDisclaimerPage from '@/routes/legal/medical-disclaimer/page';
import LegalOverviewPage from '@/routes/legal/page';
import PrivacyPolicyPage from '@/routes/legal/privacy-policy/page';
import TermsOfUsePage from '@/routes/legal/terms-of-use/page';
import ChatPage from '@/routes/missie/chat/page';
import MissieLayout from '@/routes/missie/layout';
import NotFoundPage from '@/routes/not-found/page';
import ProfilePage from '@/routes/profile/page';
import RecordsPage from '@/routes/records/page';
import RecordDetailPage from '@/routes/records/detail/page';
import UploadRecordPage from '@/routes/records/upload/page';
import SettingsPage from '@/routes/settings/page';

// Old /chat/:id links -> /missie/chat/:id
function LegacyChatRedirect() {
  const { conversationId } = useParams();
  return <Navigate to={conversationId ? `/missie/chat/${conversationId}` : '/missie/chat'} replace />;
}

// The route table. Folders under src/routes only organise the files - URLs
// and shared layouts are defined here, so add new pages here too.
export const router = createBrowserRouter([
  {
    // Root: scroll restoration, plus a friendly page if anything below crashes.
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        // only for signed-out visitors
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
          { path: '/signup/hospital', element: <HospitalSignupPage /> },
        ],
      },
      {
        // signed-in only
        element: <RequireAuth />,
        children: [
          {
            // Fidelity Health platform pages
            element: <PlatformShell />,
            children: [
              { path: '/', element: <HomePage /> },
              { path: '/records', element: <RecordsPage /> },
              { path: '/records/upload', element: <UploadRecordPage /> },
              { path: '/records/:recordId', element: <RecordDetailPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '/settings', element: <SettingsPage /> },
            ],
          },
          {
            // Fidelity Health staff (admins only; the layout checks)
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminOverviewPage /> },
              { path: 'hospitals', element: <AdminHospitalsPage /> },
              { path: 'hospitals/:userId', element: <AdminHospitalDetailPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'users/:userId', element: <AdminUserDetailPage /> },
              { path: 'records', element: <AdminRecordsPage /> },
            ],
          },
          {
            // Missie, the AI assistant
            path: '/missie',
            element: <MissieLayout />,
            children: [
              { index: true, element: <Navigate to="/missie/chat" replace /> },
              { path: 'chat', element: <ChatPage /> },
              { path: 'chat/:conversationId', element: <ChatPage /> },
            ],
          },
          { path: '/chat', element: <LegacyChatRedirect /> },
          { path: '/chat/:conversationId', element: <LegacyChatRedirect /> },
        ],
      },
      {
        // public
        element: <AboutLayout />,
        children: [{ path: '/about', element: <AboutPage /> }],
      },
      {
        // public
        path: '/legal',
        element: <LegalLayout />,
        children: [
          { index: true, element: <LegalOverviewPage /> },
          { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
          { path: 'terms-of-use', element: <TermsOfUsePage /> },
          { path: 'medical-disclaimer', element: <MedicalDisclaimerPage /> },
          { path: 'ai-use-policy', element: <AiUsePolicyPage /> },
          { path: 'cookie-policy', element: <CookiePolicyPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
