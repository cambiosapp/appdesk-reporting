import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
        <p className="text-sm text-gray-500">Cargando AppDesk...</p>
      </div>
    </div>
  );
}
