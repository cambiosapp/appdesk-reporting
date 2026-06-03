'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Bug, Sparkles, ClipboardList, Upload, X, Loader2 } from 'lucide-react';
import type { ReportType, ReportPriority, Module } from '@/lib/types';
import { REPORT_TYPE_LABELS, PRIORITY_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

const typeOptions: { value: ReportType; icon: React.ReactNode; desc: string }[] = [
  { value: 'bug', icon: <Bug className="w-5 h-5" />, desc: 'Error en el sistema' },
  { value: 'task', icon: <ClipboardList className="w-5 h-5" />, desc: 'Tarea pendiente' },
  { value: 'feature', icon: <Sparkles className="w-5 h-5" />, desc: 'Solicitud de mejora' },
];

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export default function ReportForm() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReportType | ''>('');
  const [priority, setPriority] = useState<ReportPriority | ''>('');
  const [moduleId, setModuleId] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadModules() {
      const { data } = await supabase.from('modules').select('*').order('name');
      if (data) setModules(data);
    }
    loadModules();
  }, [supabase]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const uploaded: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const filePath = `reports/${Date.now()}_${file.name}`;

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      uploaded.push({
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
      });
    }

    setFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !type || !priority || !description) {
      setError('Todos los campos obligatorios deben estar completos.');
      return;
    }

    setSubmitting(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('Debes iniciar sesión para crear un reporte.');
      setSubmitting(false);
      return;
    }

    // Create the report in Supabase
    const { data: report, error: dbError } = await supabase
      .from('reports')
      .insert({
        title,
        type,
        priority,
        description,
        module_id: moduleId || null,
        reporter_id: user.id,
        attachments: files,
        status: 'open',
      })
      .select()
      .single();

    if (dbError || !report) {
      setError('Error al guardar el reporte: ' + (dbError?.message || 'Desconocido'));
      setSubmitting(false);
      return;
    }

    // Try to create Jira ticket (non-blocking from UI perspective)
    try {
      const response = await fetch('/api/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess(`Reporte creado exitosamente. Ticket Jira: ${result.jiraKey}`);
      } else {
        setSuccess('Reporte creado localmente. Sincronización con Jira pendiente.');
      }
    } catch {
      setSuccess('Reporte creado localmente. Sincronización con Jira pendiente.');
    }

    setSubmitting(false);
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      {/* Tipo de reporte */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Reporte *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                type === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              {opt.icon}
              <span className="text-sm font-medium">{REPORT_TYPE_LABELS[opt.value]}</span>
              <span className="text-xs text-gray-400">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Título */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Describe el reporte en una línea"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>

        {/* Prioridad */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad *
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ReportPriority)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Seleccionar prioridad</option>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Módulo afectado */}
        <div>
          <label htmlFor="module" className="block text-sm font-medium text-gray-700 mb-1">
            Módulo afectado
          </label>
          <select
            id="module"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Sin módulo específico</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el reporte en detalle. Incluye pasos para reproducir si es un error."
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
            required
          />
        </div>

        {/* Archivos adjuntos */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivos adjuntos
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {uploading ? 'Subiendo...' : 'Arrastra archivos o haz clic para subir'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Imágenes, PDFs o documentos</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Creando...' : 'Crear Reporte'}
        </button>
      </div>
    </form>
  );
}
