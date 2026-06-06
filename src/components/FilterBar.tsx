'use client';

import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
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
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = typeFilter || priorityFilter || statusFilter;

  const clearFilters = () => {
    onTypeFilterChange('');
    onPriorityFilterChange('');
    onStatusFilterChange('');
  };

  return (
    <div className="space-y-3">
      {/* Search + filter toggle row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar reportes..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors shrink-0 ${
            showFilters || hasActiveFilters
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => onTypeFilterChange(e.target.value as ReportType | '')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  paddingRight: '32px',
                }}
              >
                <option value="">Todos</option>
                <option value="bug">Error</option>
                <option value="task">Tarea</option>
                <option value="feature">Mejora</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Prioridad</label>
              <select
                value={priorityFilter}
                onChange={(e) => onPriorityFilterChange(e.target.value as ReportPriority | '')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  paddingRight: '32px',
                }}
              >
                <option value="">Todas</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as ReportStatus | '')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  paddingRight: '32px',
                }}
              >
                <option value="">Todos</option>
                <option value="open">Abierto</option>
                <option value="in_progress">En Progreso</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
                <option value="reopened">Reabierto</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
