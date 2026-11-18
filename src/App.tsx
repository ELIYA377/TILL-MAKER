import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest, setUserToken } from './lib/api';
import { PublicSettings, UserAccount } from './types/app';
import { UserAuthView } from './components/portal/UserAuthView';
import { UserPortal } from './components/portal/UserPortal';
import { AdminPortal } from './components/portal/AdminPortal';
import { PWAInstallBanner, OfflineIndicator } from './components/portal/PWAComponents';

function isAdminPath(): boolean {
  return window.location.pathname.startsWith('/admin');
}

export default function App() {
  const [routeMode, setRouteMode] = useState<'user' | 'admin'>(() =>
    isAdminPath() ? 'admin' : 'user'
  );
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PublicSettings>({
    appName: 'DIGITAL SALES PRO MAX',
    creditRateTzs: 100,
    defaultRequestCost: 2,
    supportPhone: '0784615052',
    footerText: 'Developed by Digital Sales',
  });

  const bootstrap = useCallback(async () => {
    try {
      const [pubRes, meRes] = await Promise.all([
        apiRequest<PublicSettings & { success: boolean }>('/api/public/settings'),
        apiRequest<{ authenticated: boolean; user: UserAccount | null }>('/api/auth/me'),
      ]);
      setSettings(pubRes);
      setUser(meRes.user);
    } catch (err) {
      console.error('Bootstrap error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
    const onPopState = () => {
      setRouteMode(isAdminPath() ? 'admin' : 'user');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [bootstrap]);

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin/');
    setRouteMode('admin');
  };

  const navigateToUser = () => {
    window.history.pushState({}, '', '/');
    setRouteMode('user');
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    setUserToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B162C] text-white text-sm font-medium">
        Loading DIGITAL SALES PRO MAX...
      </div>
    );
  }

  return (
    <>
      <OfflineIndicator />
      {routeMode === 'admin' ? (
        <AdminPortal onNavigateUserPortal={navigateToUser} />
      ) : !user ? (
        <UserAuthView
          settings={settings}
          onSuccess={(authedUser) => setUser(authedUser)}
          onNavigateAdmin={navigateToAdmin}
        />
      ) : (
        <UserPortal
          user={user}
          settings={settings}
          onUserUpdate={(updated) => setUser(updated)}
          onLogout={handleLogout}
        />
      )}
      <PWAInstallBanner />
    </>
  );
}
