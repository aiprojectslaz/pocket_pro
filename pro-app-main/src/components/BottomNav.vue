<template>
  <nav class="bottom-nav" v-if="isLoggedIn">

    <!-- Account panel (slides up above nav) -->
    <Transition name="account-panel">
      <div v-if="accountOpen" class="account-panel">
        <div class="account-panel-user">
          <div class="account-avatar">{{ initials }}</div>
          <div>
            <p class="account-name">{{ displayName }}</p>
            <p class="account-email">{{ userEmail }}</p>
          </div>
        </div>
        <div class="account-panel-actions">
          <button class="account-panel-btn" @click="handleLogout">
            <fa icon="right-from-bracket" class="me-2" />Sign out
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop for account panel -->
    <div v-if="accountOpen" class="account-backdrop" @click="accountOpen = false"></div>

    <!-- Tab items -->
    <RouterLink
      to="/procedure-list"
      class="bottom-nav-item"
      active-class="bottom-nav-item--active"
      @click="accountOpen = false"
    >
      <fa icon="list" class="nav-tab-icon" />
      <span class="nav-tab-label">Procedures</span>
    </RouterLink>

    <RouterLink
      to="/bookmarks"
      class="bottom-nav-item"
      active-class="bottom-nav-item--active"
      @click="accountOpen = false"
    >
      <fa icon="bookmark" class="nav-tab-icon" />
      <span class="nav-tab-label">Bookmarks</span>
    </RouterLink>

    <RouterLink
      to="/quizzes"
      class="bottom-nav-item"
      active-class="bottom-nav-item--active"
      @click="accountOpen = false"
    >
      <fa icon="circle-question" class="nav-tab-icon" />
      <span class="nav-tab-label">Quiz</span>
    </RouterLink>

    <button
      class="bottom-nav-item bottom-nav-item--btn"
      :class="{ 'bottom-nav-item--active': accountOpen }"
      @click="accountOpen = !accountOpen"
    >
      <fa icon="user-circle" class="nav-tab-icon" />
      <span class="nav-tab-label">Account</span>
    </button>

  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '@/store/authState'

const router = useRouter()
const accountOpen = ref(false)

const isLoggedIn  = computed(() => authState.isLoggedIn)
const userEmail   = computed(() => authState.user?.email ?? '')
const displayName = computed(() => authState.user?.user_metadata?.display_name ?? userEmail.value)
const initials    = computed(() => {
  const name = displayName.value
  if (!name) return '?'
  const parts = name.split(/[\s@]/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
})

async function handleLogout() {
  accountOpen.value = false
  await authState.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ── Bottom nav bar ───────────────────────────── */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: stretch;
  z-index: 200;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
}

/* ── Tab items ────────────────────────────────── */
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: #9ca3af;
  font-size: 10px;
  font-weight: 500;
  min-height: 44px;
  border: none;
  background: none;
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: #374151; }
}

.bottom-nav-item--btn {
  /* button reset */
  padding: 0;
  font-family: inherit;
}

.bottom-nav-item--active {
  color: #1a2744 !important;
}

.nav-tab-icon {
  font-size: 18px;
  line-height: 1;
}

.nav-tab-label {
  font-size: 10px;
  line-height: 1;
}

/* ── Account panel ────────────────────────────── */
.account-backdrop {
  position: fixed;
  inset: 0;
  z-index: 198;
}

.account-panel {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 199;
  padding: 1rem 1.25rem;
}

.account-panel-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 0.75rem;
}

.account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1a2744;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.account-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.3;
}

.account-email {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.3;
}

.account-panel-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-panel-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0.6rem 0.25rem;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  border-radius: 6px;
  width: 100%;
  text-align: left;
  min-height: 44px;

  &:hover { background: #f9fafb; color: #111827; }
}

/* ── Transition ───────────────────────────────── */
.account-panel-enter-active,
.account-panel-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.account-panel-enter-from,
.account-panel-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
