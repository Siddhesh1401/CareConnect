import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { VolunteerHeader } from './components/layout/VolunteerHeader';
import { NGOHeader } from './components/layout/NGOHeader';
import { AdminHeader } from './components/layout/AdminHeader';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import PendingApprovalPage from './pages/auth/PendingApprovalPage';
import { RejectionResubmitPage } from './pages/auth/RejectionResubmitPage';
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';
import VolunteerBroadcasts from './pages/volunteer/VolunteerBroadcasts';
import { CommunityPage } from './pages/community/CommunityPage';
import { CommunityDetailPage } from './pages/community/CommunityDetailPage';
import { CreatePostPage } from './pages/community/CreatePostPage';
import { CreateCommunityPage } from './pages/community/CreateCommunityPage';
import { EventsPage } from './pages/events/EventsPage';
import { EventRegistrationPage } from './pages/events/EventRegistrationPage';
import { NGODashboard } from './pages/ngo/NGODashboard';
import { NGOProfileEditPage } from './pages/ngo/NGOProfileEditPage';
import NGOBroadcastsPage from './pages/ngo/NGOBroadcastsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { NGOsPage } from './pages/ngos/NGOsPage';
import { NGOProfilePage } from './pages/ngos/NGOProfilePage';
import { AboutPage } from './pages/about/AboutPage';
import { EventManagement } from './pages/ngo/EventManagement';
import { CreateEvent } from './pages/ngo/CreateEvent';
import { EditEvent } from './pages/ngo/EditEvent';
import { EventAnalytics } from './pages/ngo/EventAnalytics';
import { EventVolunteers } from './pages/ngo/EventVolunteers';
import { CampaignManagement } from './pages/ngo/CampaignManagement';
import { CreateCampaign } from './pages/ngo/CreateCampaign';
import { EditCampaign } from './pages/ngo/EditCampaign';
import CampaignAnalytics from './pages/ngo/CampaignAnalytics';
import { VolunteerManagement } from './pages/ngo/VolunteerManagement';
import { NGOVolunteerAnalytics } from './pages/ngo/NGOVolunteerAnalytics';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { StoriesPage } from './pages/stories/StoriesPage';
import { CreateStory } from './pages/stories/CreateStory';
import { StoryDetailPage } from './pages/stories/StoryDetailPage';
import { EditStoryPage } from './pages/stories/EditStoryPage';
import { NGORequestsPage } from './pages/admin/NGORequestsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import VolunteerAnalytics from './pages/admin/VolunteerAnalytics';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DemoPage } from './pages/auth/DemoPage';
import { APIAdminDashboard } from './pages/api-admin/APIAdminDashboard.tsx';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminStoriesPage } from './pages/admin/AdminStoriesPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { CampaignsPage } from './pages/campaigns/CampaignsPage';
import { CampaignDetailsPage } from './pages/campaigns/CampaignDetailsPage';
import GovernmentAccessPage from './pages/GovernmentAccessPage';
import { APIAdminHeader } from './components/layout/APIAdminHeader';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const APIAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isAPIAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAPIAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const DynamicHeader: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Header />;

  switch (user.role) {
    case 'volunteer':
      return <VolunteerHeader />;
    case 'ngo_admin':
      return <NGOHeader />;
    case 'admin':
      return <AdminHeader />;
    case 'api_admin':
      return <APIAdminHeader />;
    default:
      return <Header />;
  }
};

const AppLayout: React.FC<{ children: React.ReactNode; hideFooter?: boolean }> = ({ 
  children, 
  hideFooter = false 
}) => {
  const isDashboard = window.location.pathname.includes('/dashboard') || 
                     window.location.pathname.includes('/community') ||
                     window.location.pathname.includes('/admin');
  
  return (
    <div className="min-h-screen flex flex-col">
      {!window.location.pathname.includes('/login') && 
       !window.location.pathname.includes('/signup') && 
       !window.location.pathname.includes('/forgot-password') && (
        <DynamicHeader />
      )}
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && !isDashboard && 
       !window.location.pathname.includes('/login') && 
       !window.location.pathname.includes('/signup') && 
       !window.location.pathname.includes('/forgot-password') && (
        <Footer />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/auth/pending-approval" element={
            <PendingApprovalPage />
          } />
          <Route path="/auth/resubmit-documents" element={
            <RejectionResubmitPage />
          } />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/forgot-password" element={
            <AppLayout hideFooter>
              <ForgotPasswordPage />
            </AppLayout>
          } />
          <Route path="/about" element={
            <AppLayout>
              <AboutPage />
            </AppLayout>
          } />
          <Route path="/government-access" element={
            <AppLayout>
              <GovernmentAccessPage />
            </AppLayout>
          } />
          <Route path="/ngos" element={
            <AppLayout hideFooter>
              <NGOsPage />
            </AppLayout>
          } />
          <Route path="/ngos/:id" element={
            <AppLayout hideFooter>
              <NGOProfilePage />
            </AppLayout>
          } />
          
          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/volunteer/dashboard" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <VolunteerDashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/volunteer/broadcasts" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <VolunteerBroadcasts />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/dashboard" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <NGODashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/broadcasts" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <NGOBroadcastsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/profile/edit" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <NGOProfileEditPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/community" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <CommunityPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/community/create-post" element={
            <ProtectedRoute>
              <AppLayout>
                <CreatePostPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/community/create-community" element={
            <ProtectedRoute>
              <AppLayout>
                <CreateCommunityPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/communities/:communityId" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <CommunityDetailPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/events" element={
            <AppLayout hideFooter>
              <EventsPage />
            </AppLayout>
          } />
          
          <Route path="/events/:eventId" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <EventRegistrationPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/stories" element={
            <AppLayout hideFooter>
              <StoriesPage />
            </AppLayout>
          } />

          <Route path="/stories/create" element={
            <AppLayout hideFooter>
              <CreateStory />
            </AppLayout>
          } />

          <Route path="/stories/:id/edit" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <EditStoryPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/stories/:id" element={
            <AppLayout hideFooter>
              <StoryDetailPage />
            </AppLayout>
          } />
          
          {/* Campaign Routes */}
          <Route path="/campaigns" element={
            <AppLayout hideFooter>
              <CampaignsPage />
            </AppLayout>
          } />
          
          <Route path="/campaigns/:id" element={
            <AppLayout hideFooter>
              <CampaignDetailsPage />
            </AppLayout>
          } />
          
          {/* NGO Management Routes */}
          <Route path="/ngo/events" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <EventManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/events/create" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <CreateEvent />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/events/edit/:eventId" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <EditEvent />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/events/analytics" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <EventAnalytics />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/events/:eventId/volunteers" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <EventVolunteers />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/campaigns" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <CampaignManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/campaigns/analytics" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <CampaignAnalytics />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/campaigns/create" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <CreateCampaign />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/campaigns/:id/edit" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <EditCampaign />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/volunteers" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <VolunteerManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ngo/volunteers/analytics" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <NGOVolunteerAnalytics />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AppLayout hideFooter>
                <AdminDashboard />
              </AppLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/ngo-requests" element={
            <AdminRoute>
              <AppLayout hideFooter>
                <NGORequestsPage />
              </AppLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/users" element={
            <AdminRoute>
              <AppLayout hideFooter>
                <UserManagementPage />
              </AppLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/volunteers/analytics" element={
            <AdminRoute>
              <AppLayout hideFooter>
                <VolunteerAnalytics />
              </AppLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/settings" element={
            <AdminRoute>
              <AppLayout hideFooter>
                <SystemSettingsPage />
              </AppLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/activity" element={
            <AdminRoute>
              <AppLayout hideFooter>
                <ActivityLogPage />
              </AppLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/messages" element={
            <AdminRoute>
              <AppLayout hideFooter>
                <AdminMessagesPage />
              </AppLayout>
            </AdminRoute>
          } />

          <Route path="/admin/stories" element={
            <AdminRoute>
              <AppLayout hideFooter>
                <AdminStoriesPage />
              </AppLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/analytics" element={
            <AdminRoute>
              <AppLayout hideFooter>
                <AdminAnalyticsPage />
              </AppLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/reports" element={
            <AdminRoute>
              <AppLayout hideFooter>
                <AdminReportsPage />
              </AppLayout>
            </AdminRoute>
          } />
          
          {/* API Admin Routes */}
          <Route path="/admin/api-dashboard" element={
            <APIAdminRoute>
              <AppLayout hideFooter>
                <APIAdminDashboard />
              </AppLayout>
            </APIAdminRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <AppLayout hideFooter>
                <NotificationsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;