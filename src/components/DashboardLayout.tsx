'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from './Sidebar';
import { Loader2, Menu } from 'lucide-react';
import type { Profile } from '@/lib/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('appdesk_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      {profile && (
        <Sidebar
          role={profile.role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Hamburger â€” solo mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden shrink-0"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>
                )}
              </div>
            </div>

            {/* User badge */}
            {profile && (
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-gray-50 rounded-lg shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{profile.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {profile.role === 'admin' ? 'Admin' : 'Reportador'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
