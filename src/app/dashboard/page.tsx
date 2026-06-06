'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import FilterBar from '@/components/FilterBar';
import ReportTable from '@/components/ReportTable';
import Pagination from '@/components/Pagination';
import type { Report, ReportType, ReportPriority, ReportStatus } from '@/lib/types';
import {
  BarChart3,
  Bug,
  ClipboardCheck,
  Clock,
  Plus,
  FileText,
  Search,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 10;

export default function DashboardPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority | ''>('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [stats, setStats] = useState({ total: 0, open: 0, bugs: 0, resolved: 0 });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('reports')
      .select(`
        *,
        module:modules(*),
        reporter:profiles(*)
      `, { count: 'exact' });

    if (typeFilter) query = query.eq('type', typeFilter);
    if (priorityFilter) query = query.eq('priority', priorityFilter);
    if (statusFilter) query = query.eq('status', statusFilter);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setReports(data as unknown as Report[]);
      if (count !== null) setTotalItems(count);
    }

    setLoading(false);
  }, [supabase, currentPage, search, typeFilter, priorityFilter, statusFilter]);

  const fetchStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    let q1 = supabase.from('reports').select('*', { count: 'exact', head: true });
    if (!isAdmin) q1 = q1.eq('reporter_id', user.id);
    const { count: total } = await q1;

    let q2 = supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open');
    if (!isAdmin) q2 = q2.eq('reporter_id', user.id);
    const { count: open } = await q2;

    let q3 = supabase.from('reports').select('*', { count: 'exact', head: true }).eq('type', 'bug');
    if (!isAdmin) q3 = q3.eq('reporter_id', user.id);
    const { count: bugs } = await q3;

    let q4 = supabase.from('reports').select('*', { count: 'exact', head: true }).in('status', ['resolved', 'closed']);
    if (!isAdmin) q4 = q4.eq('reporter_id', user.id);
    const { count: resolved } = await q4;

    setStats({
      total: total || 0,
      open: open || 0,
      bugs: bugs || 0,
      resolved: resolved || 0,
    });
  }, [supabase]);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);

  // Realtime subscription
  useEffect(() => {
    channelRef.current = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          fetchReports();
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase, fetchReports, fetchStats]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const statsCards = [
    { label: 'Total Reportes', value: stats.total, icon: BarChart3, color: 'bg-blue-500' },
    { label: 'Abiertos', value: stats.open, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Errores', value: stats.bugs, icon: Bug, color: 'bg-red-500' },
    { label: 'Resueltos', value: stats.resolved, icon: ClipboardCheck, color: 'bg-green-500' },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle="Panel principal de reportes">
      {/* Stats Cards — responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    {card.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      {stats.total === 0 && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6 sm:mb-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No hay reportes aún
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Comienza reportando tu primer error, tarea o mejora. En unos pasos tendrás tu ticket en Jira.
          </p>
          <Link
            href="/reportes/nuevo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Primer Reporte
          </Link>
        </div>
      )}

      {/* Filters */}
      {stats.total > 0 && (
        <div className="mb-4 sm:mb-6">
          <FilterBar
            search={search}
            onSearchChange={handleSearchChange}
            typeFilter={typeFilter}
            onTypeFilterChange={(v) => { setTypeFilter(v); handleFilterChange(); }}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={(v) => { setPriorityFilter(v); handleFilterChange(); }}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => { setStatusFilter(v); handleFilterChange(); }}
          />
        </div>
      )}

      {/* Table */}
      {stats.total > 0 && (
        <>
          <ReportTable reports={reports} loading={loading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 bg-white rounded-xl border border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* FAB — Nuevo Reporte en mobile */}
      <Link
        href="/reportes/nuevo"
        className="fixed bottom-6 right-6 z-20 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 hover:shadow-xl transition-all flex items-center justify-center lg:hidden"
        aria-label="Nuevo Reporte"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </DashboardLayout>
  );
}
