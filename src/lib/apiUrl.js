// All application API traffic goes through one physical Vercel Function.
// This avoids filesystem catch-all routing differences between Vercel and
// local Vite while keeping clean logical endpoint names in application code.
export function apiUrl(path = '', query = '') {
  const normalized = String(path).replace(/^\/+|\/+$/g, '')
  const encodedPath = encodeURIComponent(normalized)
  const suffix = query ? (String(query).startsWith('?') ? String(query).slice(1) : String(query)) : ''
  return `/api/index?path=${encodedPath}${suffix ? `&${suffix}` : ''}`
}
