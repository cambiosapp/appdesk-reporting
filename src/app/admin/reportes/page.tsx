'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import ReportTable from '@/components/ReportTable';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';
import type { Report, ReportType, ReportPriority, ReportStatus } from '@/lib/types';

const PAGE_SIZE = 15;

export default function AdminReportesPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority | ''>('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');

  const fetchReports = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('appdesk_reports')
      .select(`
        *,
        module:appdesk_modules(*),
        reporter:appdesk_profiles(*)
      `, { count: 'exact' });

    if (typeFilter) query = query.eq('type', typeFilter);
    if (priorityFilter) query = query.eq('priority', priorityFilter);
    if (statusFilter) query = query.eq('status', statusFilter);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data) {
      setReports(data as unknown as Report[]);
      if (count !== null) setTotalItems(count);
    }

    setLoading(false);
  }, [supabase, currentPage, search, typeFilter, priorityFilter, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <DashboardLayout
      title="Todos los Reportes"
      subtitle="VisiÃƒ³n general de todos los reportes del sistema"
    >
      <div className="mb-6">
        <FilterBar
          search={search}
          onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
          typeFilter={typeFilter}
          onTypeFilterChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
        />
      </div>

      <ReportTable reports={reports} loading={loading} />

      <div className="mt-4 bg-white rounded-xl border border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
