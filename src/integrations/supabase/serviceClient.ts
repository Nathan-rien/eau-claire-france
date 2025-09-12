// Service Supabase client (Node/Edge only) - DO NOT import in browser code
// Uses SERVICE ROLE key for privileged writes. Never expose this key client-side.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export function createServiceClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xblogttmomuogdhmaztf.supabase.co';
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment');
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

export default createServiceClient;
