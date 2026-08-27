import { createClient as createSupabaseClient } from '@supabase/supabase-js'
let cachedClient=null
export function createClient(){const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL||'';const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_KEY||'';if(!url||!key)throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di environment server.');return createSupabaseClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})}
export const supabase=cachedClient||(cachedClient=createClient())
