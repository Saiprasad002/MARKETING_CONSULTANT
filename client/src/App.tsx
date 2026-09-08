import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { AnalyticsProvider } from './context/AnalyticsContext';

import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AIConsultantPage } from './pages/AIConsultantPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ExecutiveReportPage } from './pages/ExecutiveReportPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Authenticating session...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const OnboardingRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const { profile, loadingProfile } = useCompany();

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading workspace...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/signup" replace />;

  const hasCompletedOnboarding = Boolean(user?.onboardingCompleted || profile?.identity?.name?.value);
  if (hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { profile, loadingProfile } = useCompany();

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading workspace...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/signup" replace />;

  const hasCompletedOnboarding = Boolean(user?.onboardingCompleted || profile?.identity?.name?.value);
  if (!hasCompletedOnboarding) return <Navigate to="/onboarding" replace />;

  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
          <AnalyticsProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage initialMode="signup" />} />
              <Route path="/signup" element={<AuthPage initialMode="signup" />} />
              <Route path="/login" element={<AuthPage initialMode="signin" />} />

              <Route
                path="/onboarding"
                element={
                  <OnboardingRouteGuard>
                    <OnboardingPage />
                  </OnboardingRouteGuard>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/consultant"
                element={
                  <ProtectedRoute>
                    <AIConsultantPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/discovery-chat" element={<Navigate to="/consultant" replace />} />
              <Route path="/analytics-chat" element={<Navigate to="/consultant" replace />} />

              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <DocumentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <RecommendationsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <ExecutiveReportPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </AnalyticsProvider>
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
