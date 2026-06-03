'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import type { Report } from '@/lib/types';
import {
  REPORT_TYPE_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from '@/lib/types';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  User,
  Building2,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ReporteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      if (!params.id) return;

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          module:modules(*),
          reporter:profiles(*)
        `)
        .eq('id', params.id)
        .single();

      if (!error && data) {
        setReport(data as unknown as Report);
      }
      setLoading(false);
    }

    loadReport();
  }, [supabase, params.id]);

  if (loading) {
    return (
      <DashboardLayout title="Cargando...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout title="Reporte no encontrado">
        <div className="text-center py-20">
          <p className="text-gray-500">El reporte no existe o no tienes acceso.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Volver al Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={report.title} subtitle="Detalle del reporte">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
            </div>

            {/* Attachments */}
            {report.attachments && report.attachments.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Archivos adjuntos ({report.attachments.length})
                </h2>
                <div className="space-y-2">
                  {report.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 group-hover:text-emerald-600">
                            {att.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(att.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Información
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Estado</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}
                  >
                    {STATUS_LABELS[report.status]}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Tipo</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {REPORT_TYPE_LABELS[report.type]}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Prioridad</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[report.priority]}`}
                  >
                    {PRIORITY_LABELS[report.priority]}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="space-y-3">
                {report.module && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Módulo</p>
                      <p className="text-sm text-gray-700">{report.module.name}</p>
                    </div>
                  </div>
                )}
                {report.reporter && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Reportado por</p>
                      <p className="text-sm text-gray-700">{report.reporter.name}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Creado</p>
                    <p className="text-sm text-gray-700">{formatDate(report.created_at)}</p>
                  </div>
                </div>
                {report.jira_ticket_key && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-400">Jira</p>
                      <a
                        href={`${process.env.NEXT_PUBLIC_JIRA_URL}/browse/${report.jira_ticket_key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                      >
                        {report.jira_ticket_key}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
