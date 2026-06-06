'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bug,
  PlusCircle,
  Settings,
  Users,
  Blocks,
  ClipboardList,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/types';
import { useEffect, useRef } from 'react';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = (role: UserRole) => [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reportes/nuevo', label: 'Nuevo Reporte', icon: PlusCircle },
  ...(role === 'admin'
    ? [
        { href: '/admin', label: 'Admin Panel', icon: Settings },
        { href: '/admin/modulos', label: 'Módulos', icon: Blocks },
        { href: '/admin/reportes', label: 'Todos los Reportes', icon: ClipboardList },
        { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
      ]
    : []),
];

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleNav = () => {
    onClose();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay — only on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out',
          // Mobile: off-canvas
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible (static positioning)
          'lg:translate-x-0 lg:static lg:z-auto'
        )}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={handleNav}>
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
              <Bug className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">AppDesk</h1>
              <p className="text-xs text-slate-400">Portal de Reportes</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems(role).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNav}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white w-full transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
