<template>
  <div class="admin-layout d-flex">
    <!-- Sidebar -->
    <nav class="admin-sidebar">
      <div class="sidebar-header">Admin Panel</div>
      <ul class="sidebar-nav">
        <li><RouterLink to="/admin/procedures" class="sidebar-link">Procedures</RouterLink></li>
        <li><RouterLink to="/admin/sub-procedures" class="sidebar-link">Sub-Procedures</RouterLink></li>
        <li><RouterLink to="/admin/definitions" class="sidebar-link">Definitions</RouterLink></li>
        <li><RouterLink to="/admin/appendices" class="sidebar-link">Appendices</RouterLink></li>
        <li><RouterLink to="/admin/main-roles" class="sidebar-link">Main Roles</RouterLink></li>
      </ul>
    </nav>

    <!-- Main content -->
    <main class="admin-main flex-grow-1 p-4">
      <router-view />
    </main>
  </div>
</template>

<script>
import { authState } from '@/store/authState';

export default {
  name: 'AdminLayout',
  created() {
    if (!authState.isAdmin) {
      this.$router.push('/');
    }
  },
};
</script>

<style scoped lang="scss">
.admin-layout {
  min-height: calc(100vh - 70px);
}

.admin-sidebar {
  width: 200px;
  min-width: 200px;
  background-color: var(--brand-primary);
  padding: 0;

  .sidebar-header {
    padding: 1rem 1.25rem;
    font-weight: 700;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.6);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .sidebar-nav {
    list-style: none;
    padding: 0.5rem 0;
    margin: 0;
  }

  .sidebar-link {
    display: block;
    padding: 0.6rem 1.25rem;
    color: rgba(255,255,255,0.85);
    text-decoration: none;
    font-size: 0.9rem;
    transition: background 0.15s;

    &:hover, &.router-link-active {
      background: rgba(255,255,255,0.12);
      color: #fff;
    }
  }
}

.admin-main {
  background: #f8f9fa;
}
</style>
