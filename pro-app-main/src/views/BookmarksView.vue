<template>
  <div class="bookmarks-page">

    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">My Bookmarks</h1>
      <div class="sort-control" v-if="bookmarks.length > 0">
        <span class="sort-label">Sort:</span>
        <button class="sort-btn" @click="cycleSortBy">
          {{ sortLabels[sortBy] }} <span class="sort-caret">›</span>
        </button>
      </div>
    </div>

    <!-- Error -->
    <p v-if="error" class="error-msg">{{ error }}</p>

    <!-- Empty state -->
    <div v-else-if="!loading && bookmarks.length === 0" class="empty-state">
      <fa icon="bookmark" class="empty-icon" />
      <p>No bookmarks yet. Start bookmarking {{ contentLabelPlural.toLowerCase() }} to see them here.</p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
      Loading…
    </div>

    <!-- 2-column card grid -->
    <div v-else class="bookmarks-grid">
      <div
        v-for="bookmark in sortedBookmarks"
        :key="bookmark.id"
        class="bookmark-card"
      >
        <div class="bm-card-body">
          <span class="bm-number">{{ bookmark.attributes.procedure_number }}</span>
          <h3 class="bm-name">{{ bookmark.attributes.name }}</h3>
          <p class="bm-meta">
            <span v-if="bookmark.attributes.chapter?.title">{{ bookmark.attributes.chapter.title }}</span>
            <span v-if="bookmark.attributes.chapter?.title && bookmark.attributes.issue_date"> · </span>
            <span v-if="bookmark.attributes.issue_date">Issued {{ bookmark.attributes.issue_date }}</span>
            <span v-if="bookmark.attributes.status === 'Amended'"> · Amended</span>
          </p>
        </div>
        <div class="bm-card-actions">
          <RouterLink
            :to="{ name: 'procedure-item', params: { id: bookmark.id } }"
            class="bm-btn-open"
          >Open <fa icon="arrow-right" /></RouterLink>
          <button class="bm-btn-remove" @click="removeBookmark(bookmark.id)">Remove</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import api from '@/services/api'
import { authState } from '@/store/authState'
import { useTenant } from '@/composables/useTenant'

const SORT_CYCLE = ['recent', 'chapter']
const SORT_LABELS = { recent: 'Recently added', chapter: 'Chapter' }

export default {
  setup() {
    const { contentLabelPlural } = useTenant()
    return { contentLabelPlural }
  },
  data() {
    return {
      bookmarks: [],
      loading: true,
      error: null,
      sortBy: 'recent',
      sortLabels: SORT_LABELS,
    }
  },
  computed: {
    isLoggedIn() { return authState.isLoggedIn },
    sortedBookmarks() {
      const list = [...this.bookmarks]
      if (this.sortBy === 'chapter') {
        list.sort((a, b) => {
          const ca = a.attributes.chapter?.title ?? ''
          const cb = b.attributes.chapter?.title ?? ''
          if (ca !== cb) return ca.localeCompare(cb)
          return (a.attributes.procedure_number ?? '').localeCompare(b.attributes.procedure_number ?? '')
        })
      }
      // 'recent' keeps the original fetch order (newest first from API)
      return list
    },
  },
  async beforeMount() {
    await this.fetchBookmarks()
  },
  methods: {
    cycleSortBy() {
      const idx = SORT_CYCLE.indexOf(this.sortBy)
      this.sortBy = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]
    },
    async fetchBookmarks() {
      if (!this.isLoggedIn) {
        this.error = 'You need to be logged in to view your bookmarks.'
        this.loading = false
        return
      }
      try {
        this.bookmarks = await api.getUserBookmarkedProcedures(authState.user.id)
      } catch (err) {
        console.error('Error fetching bookmarks:', err)
        this.error = 'Error fetching bookmarks. Please try again later.'
      } finally {
        this.loading = false
      }
    },
    async removeBookmark(procedureId) {
      if (!this.isLoggedIn) { this.$router.push('/login'); return }
      try {
        await api.removeBookmark(authState.user.id, procedureId)
        this.bookmarks = this.bookmarks.filter(b => b.id !== procedureId)
      } catch (err) {
        console.error('Error removing bookmark:', err)
      }
    },
  },
}
</script>

<style scoped lang="scss">
.bookmarks-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.75rem 1rem;
}

/* ── Page header ──────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 20px;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.sort-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  &:hover { color: #111827; }
}

.sort-caret { color: #9ca3af; margin-left: 2px; }

/* ── States ───────────────────────────────────── */
.loading-state {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 2rem 0;
}

.empty-state {
  text-align: left;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 3rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-icon {
  font-size: 1.5rem;
  color: #d1d5db;
}

.error-msg {
  color: #dc2626;
  font-size: 0.875rem;
}

/* ── Bookmark grid ────────────────────────────── */
.bookmarks-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
}

/* ── Bookmark card ────────────────────────────── */
.bookmark-card {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 1rem 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.bm-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.bm-number {
  display: inline-block;
  background: #1a2744;
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 20px;
  align-self: flex-start;
}

.bm-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.35;
}

.bm-meta {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.4;
}

/* ── Card actions ─────────────────────────────── */
.bm-card-actions {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 0.75rem;
}

.bm-btn-open {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #1a2744;
  color: #fff !important;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 6px;
  text-decoration: none !important;
  transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
}

.bm-btn-remove {
  background: none;
  border: none;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  padding: 6px 4px;
  &:hover { color: #dc2626; }
}

@media (max-width: 640px) {
  .bookmarks-grid { grid-template-columns: 1fr; }
}
</style>
