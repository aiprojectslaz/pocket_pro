<template>
<header class="app-header">

  <nav class="app-header navbar navbar-expand-lg">
    <div class="container-fluid">

      <!-- Brand: logo icon + org name + org pill -->
      <RouterLink to="/" class="navbar-brand d-flex align-items-center gap-2">
        <!-- Tenant logo if set, else initials box -->
        <img
          v-if="tenant?.logo"
          :src="tenant.logo"
          height="36"
          :alt="orgName"
          loading="lazy"
          class="tenant-logo"
        />
        <span v-else class="logo-initials" aria-hidden="true">
          {{ initials }}
        </span>

        <span class="product-name">{{ orgName }}</span>
        <span class="org-pill">{{ orgName }}</span>
      </RouterLink>

      <!-- Search bar (desktop, logged-in) -->
      <div class="search-bar d-none d-lg-flex align-items-center mx-3 flex-grow-1" v-if="isLoggedIn">
        <input
          type="text"
          v-model="searchQuery"
          @keyup.enter="performSearch"
          class="form-control form-control-sm"
          :placeholder="`Search ${contentLabel.toLowerCase()}s…`"
        />
        <button @click="performSearch" class="btn btn-sm btn-ghost ms-1">
          <fa icon="search" />
        </button>
      </div>

      <!-- Mobile toggler -->
      <button
        class="navbar-toggler border-0"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarMain"
        aria-controls="navbarMain"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <fa icon="bars" />
      </button>

      <!-- Collapsible nav -->
      <div class="collapse navbar-collapse" id="navbarMain">

        <!-- Nav links -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0" v-if="isLoggedIn">
          <li class="nav-item">
            <RouterLink to="/procedure-list" class="nav-link" active-class="nav-link-active">
              {{ tenant?.content_label_plural ?? 'Procedures' }}
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/bookmarks" class="nav-link" active-class="nav-link-active">Bookmarks</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/quizzes" class="nav-link" active-class="nav-link-active">Quiz</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/admin" class="nav-link" active-class="nav-link-active">Dashboard</RouterLink>
          </li>
        </ul>

        <!-- Mobile search -->
        <div class="d-flex d-lg-none mb-2 px-1" v-if="isLoggedIn">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="performSearch"
            class="form-control form-control-sm me-1"
            :placeholder="`Search ${contentLabel.toLowerCase()}s…`"
          />
          <button @click="performSearch" class="btn btn-sm btn-outline-secondary">
            <fa icon="search" />
          </button>
        </div>

        <!-- Right: Account or Login -->
        <div class="d-flex align-items-center ms-auto">
          <div v-if="isLoggedIn" class="dropdown">
            <button
              class="btn btn-sm btn-outline-brand dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Account
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#">My profile</a></li>
              <li><a class="dropdown-item" href="#">Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" @click.prevent="logout">Logout</a></li>
            </ul>
          </div>
          <div v-else>
            <RouterLink to="/login" class="btn btn-sm btn-brand">Login</RouterLink>
          </div>
        </div>

      </div>
    </div>
  </nav>

</header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { authState } from '@/store/authState'
import { useTenant } from '@/composables/useTenant'

const router = useRouter()
const searchQuery = ref('')
const { tenant, orgName, contentLabel } = useTenant()

const isLoggedIn = computed(() => authState.isLoggedIn)

// First 2 letters of org name for the fallback initials box
const initials = computed(() =>
  orgName.value
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
)

async function logout() {
  await authState.logout()
  router.push('/login')
}

async function performSearch() {
  if (!searchQuery.value.trim()) return
  try {
    const response = await api.getProcedures()
    const q = searchQuery.value.toLowerCase()
    const results = (response.data || []).filter(p => {
      const a = p.attributes
      return (a.name || '').toLowerCase().includes(q) ||
             (a.procedure_number || '').toLowerCase().includes(q) ||
             (a.rationale || '').toLowerCase().includes(q)
    })
    router.push({
      name: 'search-results',
      query: { q: searchQuery.value },
      state: { results: { data: results } },
    })
  } catch (error) {
    console.error('Error performing search:', error)
  }
}
</script>

<style scoped lang="scss">
.app-header {
  background: #ffffff;
  border-bottom: 2px solid var(--brand-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .navbar {
    background: transparent;
    padding: 0.5rem 0;
  }

  /* Tenant logo image */
  .tenant-logo {
    height: 36px;
    width: auto;
    border-radius: 4px;
  }

  /* Fallback initials box */
  .logo-initials {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--brand-primary);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 700;
    border-radius: 6px;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  /* Product / org name text */
  .product-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--brand-primary);
    white-space: nowrap;
  }

  /* Org name pill */
  .org-pill {
    display: inline-block;
    background: var(--brand-primary);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 2px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }

  /* Nav links */
  .nav-link {
    color: #374151;
    font-size: 0.9rem;
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--brand-primary-light);
      color: var(--brand-primary);
    }
  }

  :deep(.router-link-active.nav-link),
  .nav-link-active {
    background: var(--brand-primary-light);
    color: var(--brand-primary) !important;
    font-weight: 600;
  }

  /* Search */
  .search-bar {
    max-width: 320px;

    .form-control {
      border-color: #d1d5db;
      font-size: 0.875rem;

      &:focus {
        border-color: var(--brand-primary);
        box-shadow: 0 0 0 2px var(--brand-primary-light);
      }
    }

    .btn-ghost {
      color: #6b7280;
      background: transparent;
      border: none;
      &:hover { color: var(--brand-primary); }
    }
  }

  .btn-outline-brand {
    border-color: var(--brand-primary);
    color: var(--brand-primary);
    font-size: 0.875rem;
    &:hover {
      background: var(--brand-primary);
      color: #fff;
    }
  }

  .btn-brand {
    background: var(--brand-primary);
    color: #fff;
    border-color: var(--brand-primary);
    font-size: 0.875rem;
    &:hover { opacity: 0.88; }
  }

  .navbar-toggler {
    color: var(--brand-primary);
    padding: 0.25rem 0.5rem;
  }
}
</style>
