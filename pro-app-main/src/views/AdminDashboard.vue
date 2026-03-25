<template>
  <div class="admin-shell">

    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <fa icon="shield-halved" class="me-2" />Admin Panel
      </div>

      <nav class="sidebar-nav">
        <p class="sidebar-section-label">Overview</p>
        <RouterLink to="/admin" class="sidebar-link" :class="{ active: route.path === '/admin' }">
          <fa icon="gauge-high" class="me-2" />Dashboard
        </RouterLink>

        <p class="sidebar-section-label">Manage</p>
        <RouterLink to="/admin/tenants" class="sidebar-link" :class="{ active: isActive('/admin/tenants') }">
          <fa icon="building" class="me-2" />Tenants
        </RouterLink>

        <RouterLink to="/admin/users" class="sidebar-link" :class="{ active: isActive('/admin/users') }">
          <fa icon="users" class="me-2" />Users
        </RouterLink>
        <RouterLink to="/admin/procedures" class="sidebar-link" :class="{ active: isActive('/admin/procedures') }">
          <fa icon="list" class="me-2" />Procedures
        </RouterLink>

        <p class="sidebar-section-label">Settings</p>
        <RouterLink to="/admin/branding" class="sidebar-link" :class="{ active: isActive('/admin/branding') }">
          <fa icon="palette" class="me-2" />Branding
        </RouterLink>
        <RouterLink to="/admin/analytics" class="sidebar-link" :class="{ active: isActive('/admin/analytics') }">
          <fa icon="chart-bar" class="me-2" />Analytics
        </RouterLink>
      </nav>
    </aside>

    <!-- Main area -->
    <div class="admin-main">
      <!-- Top bar -->
      <header class="admin-topbar">
        <span class="admin-topbar-title">Admin Panel</span>
        <RouterLink to="/procedure-list" class="back-link">
          <fa icon="arrow-left" class="me-1" />Back to app
        </RouterLink>
      </header>

      <!-- Child route content -->
      <main class="admin-content">
        <RouterView />
      </main>
    </div>

  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path) {
  return route.path.startsWith(path)
}
</script>

<style scoped>
.admin-shell {
  display: flex;
  min-height: calc(100vh - 60px); /* subtract approx header height */
}

/* ── Sidebar ─────────────────────────────────────── */
.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #111827;
  color: #f9fafb;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0;
}

.sidebar-brand {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #f9fafb;
  padding: 0 1.25rem 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 0.75rem;
}

.sidebar-section-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
  padding: 0.75rem 1.25rem 0.25rem;
  margin: 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  color: #d1d5db;
  text-decoration: none;
  border-radius: 0;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: rgba(255,255,255,0.06);
    color: #fff;
  }

  &.active {
    background: rgba(220, 38, 38, 0.18);
    color: #fca5a5;
    font-weight: 600;
    border-left: 3px solid #dc2626;
  }
}

/* ── Main ────────────────────────────────────────── */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  min-width: 0;
}

.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.admin-topbar-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.back-link {
  font-size: 0.8rem;
  color: #6b7280;
  text-decoration: none;

  &:hover {
    color: #111827;
  }
}

.admin-content {
  padding: 2rem 1.5rem;
  flex: 1;
}
</style>
