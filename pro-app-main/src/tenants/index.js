import { supabase } from '@/lib/supabase'
import defaultConfig from './default.js'

export async function loadTenantConfig(org_id) {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('org_id', org_id)
      .single()

    if (error || !data) return defaultConfig

    // Map logo_url → logo to match the shape useTenant() expects
    return { ...data, logo: data.logo_url ?? null }
  } catch {
    return defaultConfig
  }
}
