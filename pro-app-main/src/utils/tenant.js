import { supabase } from '@/lib/supabase'
import { loadTenantConfig } from '@/tenants'
import { useTenant } from '@/composables/useTenant'

/**
 * Fetch the user's org_id from the profiles table, load the matching
 * tenant config, and apply it (CSS variables + reactive state).
 *
 * Falls back to 'tps' if the profile row is missing.
 */
export async function applyTenantForUser(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', userId)
    .single()

  const org_id = data?.org_id ?? 'tps'
  const config = await loadTenantConfig(org_id)
  useTenant().setTenant(config)
}
