import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '../lib/supabaseClient'
const AdminAuthContext=createContext(null)
export function AdminAuthProvider({children}){
 const [session,setSession]=useState(null); const [loading,setLoading]=useState(true)
 useEffect(()=>{ if(!supabaseBrowser){setLoading(false);return}
  let mounted=true
  supabaseBrowser.auth.getSession().then(({data})=>{if(mounted){setSession(data.session||null);setLoading(false)}})
  const {data:listener}=supabaseBrowser.auth.onAuthStateChange((_e,s)=>{if(mounted){setSession(s||null);setLoading(false)}})
  return ()=>{mounted=false;listener?.subscription?.unsubscribe()}
 },[])
 const api=useMemo(()=>({session,user:session?.user||null,isAdmin:Boolean(session?.user),loading,
  async login(email,password){if(!supabaseBrowser)throw new Error('Supabase belum dikonfigurasi.');const {data,error}=await supabaseBrowser.auth.signInWithPassword({email:String(email||'').trim(),password:String(password||'')});if(error)throw new Error(error.message||'Login gagal');return data.session},
  async logout(){if(supabaseBrowser)await supabaseBrowser.auth.signOut();setSession(null)}
 }),[session,loading])
 return <AdminAuthContext.Provider value={api}>{children}</AdminAuthContext.Provider>
}
export function useAdminAuth(){const c=useContext(AdminAuthContext);if(!c)throw new Error('useAdminAuth harus dipakai di dalam AdminAuthProvider');return c}
