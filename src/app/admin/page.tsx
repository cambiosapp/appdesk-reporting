'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { Blocks, ClipboardList, Users, BarChart3, Bug, Clock, ClipboardCheck } from 'lucide-react';

export default function AdminPanelPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    totalReports: 0,
    totalModules: 0,
    totalUsers: 0,
    openReports: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [{ count: totalReports }, { count: totalModules }, { count: totalUsers }, { count: openReports }] =
        await Promise.all([
          supabase.from('appdesk_reports').select('*', { count: 'exact', head: true }),
          supabase.from('appdesk_modules').select('*', { count: 'exact', head: true }),
          supabase.from('appdesk_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('appdesk_reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        ]);

      setStats({
        totalReports: totalReports || 0,
        totalModules: totalModules || 0,
        totalUsers: totalUsers || 0,
        openReports: openReports || 0,
      });
    }

    loadStats();
  }, [supabase]);

  const cards = [
    {
      title: 'Módulos',
      value: stats.totalModules,
      icon: Blocks,
      color: 'bg-purple-500',
      href: '/admin/modulos',
      desc: 'Gestionar módulos del sistema',
    },
    {
      title: 'Reportes',
      value: stats.totalReports,
      icon: ClipboardList,
      color: 'bg-blue-500',
      href: '/admin/reportes',
      desc: 'Todos los reportes del sistema',
    },
    {
      title: 'Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-emerald-500',
      href: '/admin/usuarios',
      desc: 'Gestionar usuarios y roles',
    },
    {
      title: 'Abiertos',
      value: stats.openReports,
      icon: Clock,
      color: 'bg-yellow-500',
      href: '/admin/reportes',
      desc: 'Reportes pendientes',
    },
  ];

  return (
    <DashboardLayout title="Panel de Administración" subtitle="Gestión del sistema">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{card.value}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{card.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/modulos"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Blocks className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Gestionar Módulos</p>
              <p className="text-xs text-gray-500">CRUD de módulos del sistema</p>
            </div>
          </Link>
          <Link
            href="/admin/reportes"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ClipboardList className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Ver Reportes</p>
              <p className="text-xs text-gray-500">Todos los reportes del sistema</p>
            </div>
          </Link>
          <Link
            href="/admin/usuarios"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Users className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Gestionar Usuarios</p>
              <p className="text-xs text-gray-500">Administrar roles y accesos</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
