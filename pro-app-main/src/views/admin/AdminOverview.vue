<template>
  <div class="admin-overview">
    <h2 class="page-title">Dashboard</h2>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
      Loading stats…
    </div>

    <template v-else>
      <!-- ── Metric cards ─────────────────────────────────── -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-icon"><fa icon="building" /></span>
          <div>
            <p class="metric-value">{{ stats.tenants }}</p>
            <p class="metric-label">Tenants</p>
          </div>
        </div>
        <div class="metric-card">
          <span class="metric-icon"><fa icon="users" /></span>
          <div>
            <p class="metric-value">{{ stats.users }}</p>
            <p class="metric-label">Users</p>
          </div>
        </div>
        <div class="metric-card">
          <span class="metric-icon"><fa icon="list" /></span>
          <div>
            <p class="metric-value">{{ stats.procedures }}</p>
            <p class="metric-label">Procedures</p>
          </div>
        </div>
        <div class="metric-card">
          <span class="metric-icon"><fa icon="arrow-right-to-bracket" /></span>
          <div>
            <p class="metric-value">{{ recentUsers.length }}</p>
            <p class="metric-label">Recent logins</p>
          </div>
        </div>
      </div>

      <!-- ── Tenant table ─────────────────────────────────── -->
      <section class="data-section">
        <h3 class="section-title">Tenants</h3>
        <div v-if="tenants.length === 0" class="empty-state">No tenants found.</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Org ID</th>
              <th>Users</th>
              <th>Since</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tenants" :key="t.org_id">
              <td><span class="org-badge">{{ t.org_id }}</span></td>
              <td>{{ t.user_count }}</td>
              <td>{{ formatDate(t.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- ── Recent users table ───────────────────────────── -->
      <section class="data-section">
        <h3 class="section-title">Recent logins</h3>
        <div v-if="recentUsers.length === 0" class="empty-state">No users found.</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Org</th>
              <th>Last login</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in recentUsers" :key="u.id">
              <td>{{ u.email }}</td>
              <td><span class="org-badge">{{ u.org_id }}</span></td>
              <td>{{ formatDate(u.last_sign_in_at) ?? '—' }}</td>
              <td>{{ formatDate(u.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const loading = ref(true)
const stats = ref({ tenants: 0, users: 0, procedures: 0 })
const tenants = ref([])
const recentUsers = ref([])

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

onMounted(async () => {
  try {
    const [
      { count: userCount },
      { count: procedureCount },
      tenantRows,
      userRows,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('procedures').select('*', { count: 'exact', head: true }),
      supabase.rpc('admin_tenant_overview'),
      supabase.rpc('admin_recent_users'),
    ])

    stats.value.users      = userCount ?? 0
    stats.value.procedures = procedureCount ?? 0

    tenants.value     = tenantRows.data ?? []
    stats.value.tenants = tenants.value.length

    recentUsers.value = userRows.data ?? []
  } catch (err) {
    console.error('Admin overview fetch error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.admin-overview {
  max-width: 900px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 2rem 0;
}

/* ── Metric cards ──────────────────────────────────── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  font-size: 1.25rem;
  color: var(--brand-primary);
  opacity: 0.7;
  flex-shrink: 0;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  margin: 0 0 2px;
}

.metric-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Tables ────────────────────────────────────────── */
.data-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.empty-state {
  padding: 2rem 1.25rem;
  color: #9ca3af;
  font-size: 0.875rem;
  text-align: center;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  text-align: left;
  padding: 0.625rem 1.25rem;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem 1.25rem;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover td {
  background: #f9fafb;
}

.org-badge {
  background: var(--brand-primary);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Responsive */
@media (max-width: 640px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
