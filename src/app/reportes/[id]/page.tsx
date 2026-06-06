'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import type { Report, Module, ReportPriority, ReportStatus } from '@/lib/types';
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
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ReporteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<ReportPriority>('medium');
  const [editStatus, setEditStatus] = useState<ReportStatus>('open');
  const [modules, setModules] = useState<Module[]>([]);
  const [editModuleId, setEditModuleId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    async function loadReport() {
      if (!params.id) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Load profile to check role
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'admin') setIsAdmin(true);
      }

      // Load modules
      const { data: modulesData } = await supabase.from('modules').select('*').order('name');
      if (modulesData) setModules(modulesData);

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

  const isOwner = currentUserId && report?.reporter_id === currentUserId;
  const canModify = isAdmin || isOwner;

  const startEdit = () => {
    if (!report) return;
    setEditTitle(report.title);
    setEditDescription(report.description);
    setEditPriority(report.priority);
    setEditStatus(report.status);
    setEditModuleId(report.module_id || '');
    setEditMode(true);
    setEditError('');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditError('');
  };

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);
    setEditError('');

    const res = await fetch(`/api/reportes/${report.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: report.id,
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        status: editStatus,
        moduleId: editModuleId || null,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setEditError(result.error || 'Error al guardar');
      setSaving(false);
      return;
    }

    setReport(result.report as unknown as Report);
    setEditMode(false);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!report) return;
    if (!confirm('¿Eliminar este reporte permanentemente? Esta acción no se puede deshacer.')) return;

    setDeleting(true);
    const res = await fetch(`/api/reportes/${report.id}?id=${report.id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      const result = await res.json();
      alert(result.error || 'Error al eliminar');
      setDeleting(false);
    }
  };

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

  const statusOptions: ReportStatus[] = ['open', 'in_progress', 'resolved', 'closed', 'reopened'];
  const priorityOptions: ReportPriority[] = ['low', 'medium', 'high', 'critical'];

  return (
    <DashboardLayout title={report.title} subtitle="Detalle del reporte">
      <div className="max-w-4xl mx-auto">
        {/* Back + Actions row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </button>

          {canModify && (
            <div className="flex items-center gap-2">
              {!editMode && (
                <>
                  <button
                    onClick={startEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
            </div>

            {/* Edit form */}
            {editMode && (
              <div className="bg-white rounded-xl border border-emerald-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Editar Reporte</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as ReportPriority)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {priorityOptions.map((p) => (
                          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as ReportStatus)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
                    <select
                      value={editModuleId}
                      onChange={(e) => setEditModuleId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Sin módulo</option>
                      {modules.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  {editError && <p className="text-sm text-red-600">{editError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Check className="w-4 h-4" />
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

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
