<template>
  <div class="procedures-list">

    <!-- Page header -->
    <div class="list-header">
      <h1 class="list-title">{{ contentLabelPlural }}</h1>
      <div class="filter-wrap" ref="filterWrap">
        <button class="filter-btn" @click="filterOpen = !filterOpen">
          <fa icon="bars-staggered" class="filter-icon" />
          Filter
        </button>

        <!-- Filter dropdown -->
        <div v-if="filterOpen" class="filter-panel">
          <p class="filter-section-label">Chapters</p>
          <label
            v-for="ch in allChapters"
            :key="ch"
            class="filter-checkbox-row"
          >
            <input type="checkbox" :value="ch" v-model="selectedChapters" />
            <span>{{ ch }}</span>
          </label>
          <div class="filter-divider"></div>
          <label class="filter-checkbox-row">
            <input type="checkbox" v-model="amendedOnly" />
            <span>Amended only</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
      Loading…
    </div>

    <!-- Grouped procedure list -->
    <template v-else>
      <div
        v-for="group in groupedProcedures"
        :key="group.chapter"
        class="chapter-group"
      >
        <div class="chapter-heading">
          <span>{{ group.chapter }}</span>
        </div>

        <RouterLink
          v-for="proc in group.items"
          :key="proc.id"
          :to="{ name: 'procedure-item', params: { id: proc.id } }"
          class="procedure-card"
        >
          <span class="proc-number">{{ proc.attributes.procedure_number }}</span>

          <div class="proc-info">
            <span class="proc-name">{{ proc.attributes.name }}</span>
            <span class="proc-chapter" v-if="proc.attributes.chapter?.title">
              {{ proc.attributes.chapter.title }}
            </span>
          </div>

          <span
            v-if="proc.attributes.status === 'Amended'"
            class="proc-amended"
          >Amended</span>

          <span class="proc-chevron">›</span>
        </RouterLink>
      </div>

      <div v-if="groupedProcedures.length === 0" class="empty-state">
        No {{ contentLabelPlural.toLowerCase() }} match the current filters.
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'
import { useTenant } from '@/composables/useTenant'

const { contentLabelPlural } = useTenant()

const procedures  = ref([])
const loading     = ref(true)
const filterOpen  = ref(false)
const amendedOnly = ref(false)
const filterWrap  = ref(null)

onMounted(async () => {
  try {
    const response = await api.getProcedures()
    procedures.value = response.data ?? []
  } catch (err) {
    console.error('Error fetching procedures:', err)
  } finally {
    loading.value = false
  }

  // Close filter panel on outside click
  document.addEventListener('click', onOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick)
})

function onOutsideClick(e) {
  if (filterWrap.value && !filterWrap.value.contains(e.target)) {
    filterOpen.value = false
  }
}

// All unique chapter titles in order
const allChapters = computed(() => {
  const seen = new Set()
  const result = []
  for (const p of procedures.value) {
    const ch = p.attributes.chapter?.title ?? 'Uncategorised'
    if (!seen.has(ch)) { seen.add(ch); result.push(ch) }
  }
  return result
})

// Initialise selectedChapters to all chapters once data loads
const selectedChapters = ref([])
const chaptersInitialised = ref(false)
const filteredProcedures = computed(() => {
  // Lazily initialise selection to all chapters
  if (!chaptersInitialised.value && allChapters.value.length > 0) {
    selectedChapters.value = [...allChapters.value]
    chaptersInitialised.value = true
  }
  return procedures.value.filter(p => {
    const ch = p.attributes.chapter?.title ?? 'Uncategorised'
    if (!selectedChapters.value.includes(ch)) return false
    if (amendedOnly.value && p.attributes.status !== 'Amended') return false
    return true
  })
})

const groupedProcedures = computed(() => {
  const map = new Map()
  for (const p of filteredProcedures.value) {
    const ch = p.attributes.chapter?.title ?? 'Uncategorised'
    if (!map.has(ch)) map.set(ch, [])
    map.get(ch).push(p)
  }
  return [...map.entries()].map(([chapter, items]) => ({ chapter, items }))
})
</script>

<style scoped lang="scss">
.procedures-list {
  max-width: 780px;
  margin: 0 auto;
  padding: 1.75rem 1rem;
}

/* ── Page header ──────────────────────────────── */
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.list-title {
  font-size: 20px;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

/* ── Filter button + panel ────────────────────── */
.filter-wrap {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
  padding: 6px 12px;
  cursor: pointer;
  transition: border-color 0.15s;
  &:hover { border-color: #9ca3af; }
}

.filter-icon { font-size: 11px; color: #6b7280; }

.filter-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  background: #fff;
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  padding: 0.75rem 1rem;
  min-width: 220px;
  z-index: 50;
}

.filter-section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-tertiary);
  margin-bottom: 0.5rem;
}

.filter-checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #374151;
  padding: 4px 0;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] { cursor: pointer; accent-color: #1a2744; }
}

.filter-divider {
  height: 0.5px;
  background: var(--color-border-tertiary);
  margin: 0.5rem 0;
}

/* ── Chapter groups ───────────────────────────── */
.chapter-group {
  margin-bottom: 1.25rem;
}

.chapter-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 0.5px;
    background: var(--color-border-tertiary);
  }
}

/* ── Procedure card ───────────────────────────── */
.procedure-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-lg);
  padding: 13px 16px;
  margin-bottom: 6px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s;

  &:hover { border-color: #1a2744; }
  &:last-child { margin-bottom: 0; }
}

.proc-number {
  flex-shrink: 0;
  background: #1a2744;
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 9px;
  border-radius: 20px;
  white-space: nowrap;
}

.proc-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.proc-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.proc-chapter {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.proc-amended {
  flex-shrink: 0;
  background: #FFF3E0;
  color: #854F0B;
  font-size: 10px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
}

.proc-chevron {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--color-text-tertiary);
  line-height: 1;
}

/* ── States ───────────────────────────────────── */
.loading-state {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 2rem 0;
}

.empty-state {
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  padding: 3rem 0;
}

@media (max-width: 576px) {
  .procedures-list { padding: 1.25rem 0.75rem; }
  .proc-name { font-size: 13px; }
}
</style>
