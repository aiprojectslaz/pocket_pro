<template>
  <div v-if="isLoggedIn" class="org-bar">
    <span class="org-dot"></span>
    <span class="org-name">{{ orgName }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { authState } from '@/store/authState'
import { useTenant } from '@/composables/useTenant'

const isLoggedIn = computed(() => authState.isLoggedIn)
const { orgName } = useTenant()
</script>

<style scoped>
.org-bar {
  height: 32px;
  background: #f0f2f5;
  border-bottom: 0.5px solid var(--color-border-tertiary);
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.org-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(26, 39, 68, 0.4);
  flex-shrink: 0;
}

.org-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
}
</style>
