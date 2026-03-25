export async function loadTenantConfig(org_id) {
  try {
    const mod = await import(`./${org_id}.js`)
    return mod.default
  } catch {
    const fallback = await import('./default.js')
    return fallback.default
  }
}
