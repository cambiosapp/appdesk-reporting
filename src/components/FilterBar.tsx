'use client';

import { Search, Filter } from 'lucide-react';
import type { ReportType, ReportPriority, ReportStatus } from '@/lib/types';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: ReportType | '';
  onTypeFilterChange: (value: ReportType | '') => void;
  priorityFilter: ReportPriority | '';
  onPriorityFilterChange: (value: ReportPriority | '') => void;
  statusFilter: ReportStatus | '';
  onStatusFilterChange: (value: ReportStatus | '') => void;
}

export default function FilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar reportes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Filtros:</span>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value as ReportType | '')}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todos los tipos</option>
          <option value="bug">Error</option>
          <option value="task">Tarea</option>
          <option value="feature">Mejora</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value as ReportPriority | '')}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as ReportStatus | '')}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todos los estados</option>
          <option value="open">Abierto</option>
          <option value="in_progress">En Progreso</option>
          <option value="resolved">Resuelto</option>
          <option value="closed">Cerrado</option>
          <option value="reopened">Reabierto</option>
        </select>
      </div>
    </div>
  );
}
