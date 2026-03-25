<template>
  <div class="admin-tenants">

    <!-- Page header -->
    <div class="page-header">
      <h2 class="page-title">Tenants</h2>
      <button class="btn-add" @click="openForm()">
        <fa icon="plus" class="me-1" />Add tenant
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
      Loading tenants…
    </div>

    <!-- Empty state -->
    <div v-else-if="tenants.length === 0" class="empty-state">
      No tenants yet. Click "Add tenant" to create one.
    </div>

    <!-- Table -->
    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Org ID</th>
            <th>Name</th>
            <th>Label</th>
            <th>Brand</th>
            <th>Users</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tenants" :key="t.org_id">
            <td><span class="org-badge" :style="{ background: t.brand_primary }">{{ t.org_id }}</span></td>
            <td class="fw-medium">{{ t.org_name }}</td>
            <td class="text-muted">{{ t.content_label }} / {{ t.content_label_plural }}</td>
            <td>
              <div class="color-swatches">
                <span class="swatch" :style="{ background: t.brand_primary }" :title="t.brand_primary"></span>
                <span class="swatch" :style="{ background: t.brand_secondary }" :title="t.brand_secondary"></span>
              </div>
            </td>
            <td>{{ userCounts[t.org_id] ?? 0 }}</td>
            <td class="text-muted">{{ formatDate(t.created_at) }}</td>
            <td>
              <div class="row-actions">
                <button class="btn-action" @click="openForm(t)">Edit</button>
                <button class="btn-action btn-action-danger" @click="confirmDelete(t)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Delete confirmation ──────────────────────── -->
    <Teleport to="body">
      <div v-if="deleteConfirm.show" class="overlay" @click.self="deleteConfirm.show = false">
        <div class="confirm-card">
          <p class="confirm-msg">
            Delete tenant <strong>{{ deleteConfirm.tenant?.org_id }}</strong>?
            This cannot be undone.
          </p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="deleteConfirm.show = false">Cancel</button>
            <button class="btn-danger" @click="deleteTenant" :disabled="saving">
              {{ saving ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Drawer form ──────────────────────────────── -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawer.open" class="drawer-overlay" @click.self="closeForm">
          <div class="drawer">
            <div class="drawer-header">
              <span>{{ drawer.isEdit ? 'Edit tenant' : 'Add tenant' }}</span>
              <button class="drawer-close" @click="closeForm">&times;</button>
            </div>

            <form class="drawer-body" @submit.prevent="saveTenant">

              <div class="field-group">
                <label>Org ID <span class="req">*</span></label>
                <input
                  v-model="form.org_id"
                  type="text"
                  placeholder="e.g. tps"
                  pattern="[a-z0-9\-]+"
                  title="Lowercase letters, numbers, hyphens only"
                  :disabled="drawer.isEdit"
                  required
                />
                <p class="field-hint">Lowercase slug, no spaces. Cannot be changed after creation.</p>
              </div>

              <div class="field-group">
                <label>Org name <span class="req">*</span></label>
                <input v-model="form.org_name" type="text" placeholder="Toronto Police Service" required />
              </div>

              <div class="field-row">
                <div class="field-group">
                  <label>Content label</label>
                  <input v-model="form.content_label" type="text" placeholder="Procedure" />
                </div>
                <div class="field-group">
                  <label>Plural label</label>
                  <input v-model="form.content_label_plural" type="text" placeholder="Procedures" />
                </div>
              </div>

              <div class="field-row">
                <div class="field-group">
                  <label>Brand primary</label>
                  <div class="color-input-row">
                    <input v-model="form.brand_primary" type="color" class="color-picker" />
                    <input v-model="form.brand_primary" type="text" class="color-text" placeholder="#1a2744" />
                  </div>
                </div>
                <div class="field-group">
                  <label>Brand secondary</label>
                  <div class="color-input-row">
                    <input v-model="form.brand_secondary" type="color" class="color-picker" />
                    <input v-model="form.brand_secondary" type="text" class="color-text" placeholder="#2d3f6b" />
                  </div>
                </div>
              </div>

              <div class="field-group">
                <label>Logo URL</label>
                <input v-model="form.logo_url" type="url" placeholder="https://…/logo.png" />
              </div>

              <div class="field-group">
                <label>Custom domain</label>
                <input v-model="form.custom_domain" type="text" placeholder="tps.pocketprocedures.com" />
              </div>

              <div class="field-group">
                <label>Footer tagline</label>
                <input v-model="form.footer_tagline" type="text" placeholder="Toronto Police Service" />
              </div>

              <div v-if="formError" class="form-error">{{ formError }}</div>

              <div class="drawer-footer">
                <button type="button" class="btn-cancel" @click="closeForm">Cancel</button>
                <button type="submit" class="btn-save" :disabled="saving">
                  {{ saving ? 'Saving…' : (drawer.isEdit ? 'Save changes' : 'Create tenant') }}
                </button>
              </div>

            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// ── State ────────────────────────────────────────────
const loading = ref(true)
const saving  = ref(false)
const tenants = ref([])
const userCounts = ref({})
const formError = ref('')

const blankForm = () => ({
  org_id:               '',
  org_name:             '',
  content_label:        'Procedure',
  content_label_plural: 'Procedures',
  brand_primary:        '#1a2744',
  brand_secondary:      '#2d3f6b',
  logo_url:             '',
  custom_domain:        '',
  footer_tagline:       '',
})

const form = reactive(blankForm())

const drawer = reactive({ open: false, isEdit: false })

const deleteConfirm = reactive({ show: false, tenant: null })

// ── Helpers ──────────────────────────────────────────
function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Data loading ─────────────────────────────────────
async function load() {
  loading.value = true
  try {
    const [{ data: rows }, { data: profiles }] = await Promise.all([
      supabase.from('tenants').select('*').order('created_at'),
      supabase.from('profiles').select('org_id'),
    ])

    tenants.value = rows ?? []

    // Build user count map: { org_id: count }
    const counts = {}
    for (const p of profiles ?? []) {
      counts[p.org_id] = (counts[p.org_id] ?? 0) + 1
    }
    userCounts.value = counts
  } finally {
    loading.value = false
  }
}

onMounted(load)

// ── Form open/close ───────────────────────────────────
function openForm(tenant = null) {
  formError.value = ''
  if (tenant) {
    Object.assign(form, {
      org_id:               tenant.org_id,
      org_name:             tenant.org_name,
      content_label:        tenant.content_label,
      content_label_plural: tenant.content_label_plural,
      brand_primary:        tenant.brand_primary,
      brand_secondary:      tenant.brand_secondary,
      logo_url:             tenant.logo_url ?? '',
      custom_domain:        tenant.custom_domain ?? '',
      footer_tagline:       tenant.footer_tagline ?? '',
    })
    drawer.isEdit = true
  } else {
    Object.assign(form, blankForm())
    drawer.isEdit = false
  }
  drawer.open = true
}

function closeForm() {
  drawer.open = false
}

// ── Save (create or update) ───────────────────────────
async function saveTenant() {
  formError.value = ''
  saving.value = true
  try {
    const payload = {
      org_id:               form.org_id.trim().toLowerCase(),
      org_name:             form.org_name.trim(),
      content_label:        form.content_label.trim() || 'Procedure',
      content_label_plural: form.content_label_plural.trim() || 'Procedures',
      brand_primary:        form.brand_primary,
      brand_secondary:      form.brand_secondary,
      logo_url:             form.logo_url.trim() || null,
      custom_domain:        form.custom_domain.trim() || null,
      footer_tagline:       form.footer_tagline.trim() || null,
    }

    const { error } = drawer.isEdit
      ? await supabase.from('tenants').update(payload).eq('org_id', payload.org_id)
      : await supabase.from('tenants').insert(payload)

    if (error) throw error

    closeForm()
    await load()
  } catch (err) {
    formError.value = err.message ?? 'Save failed. Please try again.'
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────
function confirmDelete(tenant) {
  deleteConfirm.tenant = tenant
  deleteConfirm.show = true
}

async function deleteTenant() {
  saving.value = true
  try {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('org_id', deleteConfirm.tenant.org_id)

    if (error) throw error

    deleteConfirm.show = false
    await load()
  } catch (err) {
    console.error('Delete failed:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-tenants {
  max-width: 960px;
}

/* ── Page header ──────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.btn-add {
  background: var(--brand-primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { opacity: 0.88; }
}

/* ── Loading / empty ──────────────────────────────── */
.loading-state {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 2rem 0;
}

.empty-state {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 3rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* ── Table ────────────────────────────────────────── */
.table-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  text-align: left;
  padding: 0.625rem 1rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: #f9fafb; }

.org-badge {
  display: inline-block;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fw-medium { font-weight: 500; color: #111827; }
.text-muted { color: #6b7280; }

.color-swatches { display: flex; gap: 4px; }
.swatch {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.12);
}

.row-actions { display: flex; gap: 0.5rem; }

.btn-action {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  border-radius: 5px;
  padding: 3px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  &:hover { background: #f3f4f6; }
}

.btn-action-danger {
  color: #dc2626;
  border-color: rgba(220,38,38,0.3);
  &:hover { background: rgba(220,38,38,0.06); }
}

/* ── Delete confirm ───────────────────────────────── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.confirm-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.75rem;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

.confirm-msg {
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 1.25rem;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* ── Drawer ───────────────────────────────────────── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: flex-end;
  z-index: 1050;
}

.drawer {
  background: #fff;
  width: 420px;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 0.9rem;
  color: #111827;
  flex-shrink: 0;
}

.drawer-close {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
  &:hover { color: #374151; }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.field-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.req { color: #dc2626; }

.field-group input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.45rem 0.65rem;
  font-size: 0.875rem;
  color: #111827;
  width: 100%;
  &:focus { outline: none; border-color: var(--brand-primary); box-shadow: 0 0 0 2px rgba(26,39,68,0.1); }
  &:disabled { background: #f9fafb; color: #9ca3af; }
}

.field-hint {
  font-size: 0.72rem;
  color: #9ca3af;
  margin: 0;
}

.color-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker {
  width: 40px !important;
  height: 36px;
  padding: 2px !important;
  cursor: pointer;
  border-radius: 6px;
  flex-shrink: 0;
}

.color-text {
  flex: 1;
  font-family: monospace;
}

.form-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
  margin-top: auto;
}

/* Shared buttons */
.btn-cancel {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
  border-radius: 6px;
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  &:hover { background: #f9fafb; }
}

.btn-save {
  background: var(--brand-primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.45rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.btn-danger {
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #b91c1c; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

/* Drawer slide transition */
.drawer-enter-active,
.drawer-leave-active { transition: transform 0.22s ease; }
.drawer-enter-from,
.drawer-leave-to { transform: translateX(100%); }
</style>
