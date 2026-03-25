import { ref, computed } from 'vue'

const tenant = ref(null)

export function useTenant() {
  function setTenant(config) {
    tenant.value = config
    document.documentElement.style.setProperty('--brand-primary', config.brand_primary)
    document.documentElement.style.setProperty('--brand-secondary', config.brand_secondary)
  }

  const contentLabel = computed(() => tenant.value?.content_label ?? 'Procedure')
  const contentLabelPlural = computed(() => tenant.value?.content_label_plural ?? 'Procedures')
  const orgName = computed(() => tenant.value?.org_name ?? 'Pocket Procedures')

  return { tenant, setTenant, contentLabel, contentLabelPlural, orgName }
}
