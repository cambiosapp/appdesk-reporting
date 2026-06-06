'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardLayout from '@/components/DashboardLayout';
import type { Profile, UserRole } from '@/lib/types';
import { Users, Pencil, Loader2, Shield, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminUsuariosPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('reporter');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProfiles = async () => {
    const { data } = await supabase.from('appdesk_profiles').select('*').order('name');
    if (data) setProfiles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, [supabase]);

  const handleToggleRole = async (profile: Profile) => {
    const newRole: UserRole = profile.role === 'admin' ? 'reporter' : 'admin';
    const { error } = await supabase
      .from('appdesk_profiles')
      .update({ role: newRole })
      .eq('id', profile.id);

    if (!error) {
      loadProfiles();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!email.trim() || !name.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios');
      setSaving(false);
      return;
    }

    try {
      // Create user via Supabase Auth admin API
      const adminClient = createAdminClient();
      const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
        user_metadata: { name: name.trim(), role },
      });

      if (createError) {
        setError(createError.message);
        setSaving(false);
        return;
      }

      if (userData.user) {
        // Create profile
        const { error: profileError } = await adminClient.from('appdesk_profiles').insert({
          id: userData.user.id,
          name: name.trim(),
          role,
        });

        if (profileError) {
          setError('Usuario creado pero error al crear perfil: ' + profileError.message);
        } else {
          loadProfiles();
          setEmail('');
          setName('');
          setPassword('');
          setRole('reporter');
          setShowForm(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    }

    setSaving(false);
  };

  return (
    <DashboardLayout
      title="Gestión de Usuarios"
      subtitle="Administrar usuarios y roles del sistema"
    >
      {/* Info card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Administración de Usuarios</h3>
              <p className="text-xs text-gray-500">
                {profiles.length} usuario{profiles.length !== 1 ? 's' : ''} registrado{profiles.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Users className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Create user form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Nuevo Usuario</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña temporal"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="reporter">Reportador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear Usuario
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Sin usuarios</h3>
          <p className="text-gray-500">No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rol</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Registrado</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-emerald-600">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{profile.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {profile.role === 'admin' ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {profile.role === 'admin' ? 'Admin' : 'Reportador'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{formatDate(profile.created_at)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleRole(profile)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Cambiar Rol
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
