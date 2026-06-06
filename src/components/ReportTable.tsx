'use client';

import Link from 'next/link';
import type { Report } from '@/lib/types';
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_ICONS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from '@/lib/types';
import { ExternalLink, Loader2, Eye, FileText, User } from 'lucide-react';
import { formatRelativeTime, formatDate } from '@/lib/utils';

interface ReportTableProps {
  reports: Report[];
  loading: boolean;
}

export default function ReportTable({ reports, loading }: ReportTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Sin resultados</h3>
        <p className="text-sm text-gray-500">
          No se encontraron reportes con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 lg:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Título</th>
              <th className="text-left px-4 lg:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
              <th className="text-left px-4 lg:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Prioridad</th>
              <th className="text-left px-4 lg:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="text-left px-4 lg:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Módulo</th>
              <th className="text-left px-4 lg:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Creado</th>
              <th className="text-center px-4 lg:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Jira</th>
              <th className="text-right px-4 lg:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 lg:px-6 py-4">
                  <Link
                    href={`/reportes/${report.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1"
                  >
                    {report.title}
                  </Link>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    {REPORT_TYPE_ICONS[report.type]}
                    {REPORT_TYPE_LABELS[report.type]}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[report.priority]}`}
                  >
                    {PRIORITY_LABELS[report.priority]}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}
                  >
                    {STATUS_LABELS[report.status]}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {report.module?.name || '-'}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <span className="text-sm text-gray-500" title={formatDate(report.created_at)}>
                    {formatRelativeTime(report.created_at)}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 text-center">
                  {report.jira_ticket_key ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_JIRA_URL}/browse/${report.jira_ticket_key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      {report.jira_ticket_key}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 lg:px-6 py-4 text-right">
                  <Link
                    href={`/reportes/${report.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {reports.map((report) => (
          <Link
            key={report.id}
            href={`/reportes/${report.id}`}
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow active:scale-[0.99]"
          >
            {/* Title */}
            <div className="flex items-start gap-3 mb-3">
              <span className="text-lg shrink-0 mt-0.5">
                {REPORT_TYPE_ICONS[report.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                  {report.title}
                </p>
                {report.module && (
                  <p className="text-xs text-gray-400 mt-0.5">{report.module.name}</p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[report.priority]}`}
              >
                {PRIORITY_LABELS[report.priority]}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}
              >
                {STATUS_LABELS[report.status]}
              </span>
              {report.jira_ticket_key && (
                <span className="inline-flex items-center gap-0.5 text-xs text-blue-600 font-medium">
                  <ExternalLink className="w-3 h-3" />
                  {report.jira_ticket_key}
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
              <span>{formatRelativeTime(report.created_at)}</span>
              {report.reporter && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {report.reporter.name}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
