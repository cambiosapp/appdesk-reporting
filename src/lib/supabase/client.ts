'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Crea el cliente de Supabase para el browser.
 * Las NEXT_PUBLIC_* se inyectan en build-time, pero
 * durante la imagen Docker (CI) pueden no estar disponibles
 * y solo se necesitan en runtime en el browser.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // En SSR / build-time sin env vars devolvemos un stub
    // que no rompe el build. En el browser siempre estarán.
    console.warn('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    // Retornamos un cliente no funcional para no romper el build
    return createBrowserClient(
      supabaseUrl || 'https://missing.supabase.co',
      supabaseAnonKey || 'missing-key'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
