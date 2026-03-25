<template>
  <div class="admin-branding">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Branding</h2>
        <p class="page-subtitle">Customise colours, labels, and logos for each tenant.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
      Loading tenants…
    </div>

    <div v-else class="editor-layout">

      <!-- ── Left: Edit form ─────────────────────────── -->
      <div class="edit-panel">

        <!-- Tenant selector -->
        <div class="field-group">
          <label>Tenant</label>
          <select v-model="selectedOrgId" @change="onTenantChange" class="field-select">
            <option v-for="t in tenants" :key="t.org_id" :value="t.org_id">
              {{ t.org_name }} ({{ t.org_id }})
            </option>
          </select>
        </div>

        <div v-if="form.org_id" class="form-fields">

          <div class="section-divider">Identity</div>

          <div class="field-group">
            <label>Org name</label>
            <input v-model="form.org_name" type="text" class="field-input" placeholder="Toronto Police Service" />
          </div>

          <div class="field-group">
            <label>Content label</label>
            <div class="label-row">
              <select v-model="form.content_label" class="field-select" @change="autoPlural">
                <option>Procedure</option>
                <option>Protocol</option>
                <option>Regulation</option>
                <option>Checklist</option>
                <option value="__custom__">Custom…</option>
              </select>
              <input
                v-if="isCustomLabel"
                v-model="customLabelValue"
                type="text"
                class="field-input"
                placeholder="e.g. Guideline"
                @input="form.content_label = customLabelValue"
              />
            </div>
          </div>

          <div class="field-group">
            <label>Plural label</label>
            <input v-model="form.content_label_plural" type="text" class="field-input" placeholder="Procedures" />
            <p class="field-hint">How the content type is referenced in lists and headings.</p>
          </div>

          <div class="section-divider">Brand colours</div>

          <div class="field-row">
            <div class="field-group">
              <label>Primary</label>
              <div class="color-input-row">
                <input v-model="form.brand_primary" type="color" class="color-picker" />
                <input v-model="form.brand_primary" type="text" class="color-text field-input" placeholder="#1a2744" />
              </div>
            </div>
            <div class="field-group">
              <label>Secondary</label>
              <div class="color-input-row">
                <input v-model="form.brand_secondary" type="color" class="color-picker" />
                <input v-model="form.brand_secondary" type="text" class="color-text field-input" placeholder="#2d3f6b" />
              </div>
            </div>
          </div>

          <div class="section-divider">Logo</div>

          <div class="field-group">
            <div v-if="form.logo_url" class="logo-preview-row">
              <img :src="form.logo_url" alt="Logo" class="logo-thumb" />
              <button type="button" class="btn-remove-logo" @click="form.logo_url = ''">Remove</button>
            </div>
            <label class="upload-label">
              <fa icon="upload" class="me-1" />
              {{ uploadState === 'uploading' ? 'Uploading…' : 'Choose logo file' }}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                class="upload-input"
                @change="handleLogoUpload"
                :disabled="uploadState === 'uploading'"
              />
            </label>
            <p class="field-hint">PNG or SVG recommended. Uploads to <code>logos/{{ form.org_id }}/logo.png</code> in Supabase Storage.</p>
            <p v-if="uploadError" class="field-error">{{ uploadError }}</p>
          </div>

          <div class="section-divider">Other</div>

          <div class="field-group">
            <label>Footer tagline</label>
            <input v-model="form.footer_tagline" type="text" class="field-input" placeholder="Toronto Police Service" />
          </div>

          <div v-if="saveError" class="form-error">{{ saveError }}</div>

          <div class="form-footer">
            <button type="button" class="btn-reset" @click="resetForm">Reset</button>
            <button type="button" class="btn-save" :disabled="saving || uploadState === 'uploading'" @click="save">
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
          </div>

          <div v-if="saveSuccess" class="save-success">
            <fa icon="check" class="me-1" />Changes saved.
          </div>

        </div><!-- /form-fields -->
      </div><!-- /edit-panel -->

      <!-- ── Right: Live preview ─────────────────────── -->
      <div
        class="preview-panel"
        :style="{
          '--p-primary':   form.brand_primary   || '#1a2744',
          '--p-secondary': form.brand_secondary || '#2d3f6b',
        }"
      >
        <p class="preview-label">Live preview</p>

        <!-- Mini header -->
        <div class="preview-header">
          <div class="preview-brand">
            <img
              v-if="form.logo_url"
              :src="form.logo_url"
              alt="logo"
              class="preview-logo"
            />
            <div v-else class="preview-logo-placeholder">PP</div>
            <span class="preview-org-name">{{ form.org_name || 'Org Name' }}</span>
          </div>
          <div class="preview-nav-links">
            <span class="preview-nav-link">{{ form.content_label_plural || 'Procedures' }}</span>
            <span class="preview-nav-link">Search</span>
            <span class="preview-nav-link active">Bookmarks</span>
          </div>
        </div>

        <!-- Mini procedure card -->
        <div class="preview-card-area">
          <p class="preview-section-label">{{ form.content_label_plural || 'Procedures' }}</p>
          <div class="preview-card">
            <div class="preview-card-num" :style="{ background: form.brand_primary || '#1a2744' }">14-01</div>
            <div class="preview-card-body">
              <p class="preview-card-title">Use of Force — Response Options</p>
              <p class="preview-card-chapter">Chapter 14 · Use of Force</p>
            </div>
            <div class="preview-card-chevron">›</div>
          </div>
          <div class="preview-card preview-card-dim">
            <div class="preview-card-num" :style="{ background: form.brand_primary || '#1a2744' }">14-02</div>
            <div class="preview-card-body">
              <p class="preview-card-title">De-escalation Techniques</p>
              <p class="preview-card-chapter">Chapter 14 · Use of Force</p>
            </div>
            <div class="preview-card-chevron">›</div>
          </div>
        </div>

        <!-- Mini detail header -->
        <div class="preview-detail-header" :style="{ background: form.brand_primary || '#1a2744' }">
          <p class="preview-detail-breadcrumb">{{ form.content_label_plural || 'Procedures' }} › Chapter 14</p>
          <p class="preview-detail-title">14-01 · Use of Force — Response Options</p>
          <div class="preview-detail-actions">
            <span class="preview-btn">← Previous</span>
            <span class="preview-btn">Next →</span>
            <span class="preview-btn preview-btn-outline">Bookmark</span>
          </div>
        </div>

        <!-- Footer tagline -->
        <div class="preview-footer">
          <span>{{ form.footer_tagline || form.org_name || 'Your Organization' }}</span>
          <span class="preview-footer-copy">© {{ new Date().getFullYear() }}</span>
        </div>

      </div><!-- /preview-panel -->
    </div><!-- /editor-layout -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/composables/useTenant'
import { authState } from '@/store/authState'

const { setTenant } = useTenant()

// ── State ─────────────────────────────────────────────
const loading      = ref(true)
const saving       = ref(false)
const saveError    = ref('')
const saveSuccess  = ref(false)
const uploadState  = ref('idle')   // 'idle' | 'uploading' | 'done' | 'error'
const uploadError  = ref('')
const tenants      = ref([])
const selectedOrgId = ref('')
const customLabelValue = ref('')

const PRESET_LABELS = ['Procedure', 'Protocol', 'Regulation', 'Checklist']

const blankForm = () => ({
  org_id:               '',
  org_name:             '',
  content_label:        'Procedure',
  content_label_plural: 'Procedures',
  brand_primary:        '#1a2744',
  brand_secondary:      '#2d3f6b',
  logo_url:             '',
  footer_tagline:       '',
})

const form = reactive(blankForm())

// ── Computed ──────────────────────────────────────────
const isCustomLabel = computed(() =>
  form.content_label === '__custom__' || !PRESET_LABELS.includes(form.content_label)
)

// ── Data loading ──────────────────────────────────────
async function load() {
  loading.value = true
  try {
    const { data } = await supabase.from('tenants').select('*').order('org_name')
    tenants.value = data ?? []
    if (tenants.value.length > 0) {
      selectedOrgId.value = tenants.value[0].org_id
      applyTenantToForm(tenants.value[0])
    }
  } finally {
    loading.value = false
  }
}

function applyTenantToForm(t) {
  Object.assign(form, {
    org_id:               t.org_id,
    org_name:             t.org_name,
    content_label:        t.content_label        ?? 'Procedure',
    content_label_plural: t.content_label_plural ?? 'Procedures',
    brand_primary:        t.brand_primary        ?? '#1a2744',
    brand_secondary:      t.brand_secondary      ?? '#2d3f6b',
    logo_url:             t.logo_url             ?? '',
    footer_tagline:       t.footer_tagline       ?? '',
  })
  // If content_label is not a preset, set the custom input value
  if (!PRESET_LABELS.includes(form.content_label)) {
    customLabelValue.value = form.content_label
  }
  saveError.value = ''
  saveSuccess.value = false
  uploadError.value = ''
  uploadState.value = 'idle'
}

onMounted(load)

// ── Tenant selector ───────────────────────────────────
function onTenantChange() {
  const t = tenants.value.find(t => t.org_id === selectedOrgId.value)
  if (t) applyTenantToForm(t)
}

function resetForm() {
  const t = tenants.value.find(t => t.org_id === form.org_id)
  if (t) applyTenantToForm(t)
}

// ── Content label helpers ─────────────────────────────
const PLURAL_MAP = {
  Procedure:  'Procedures',
  Protocol:   'Protocols',
  Regulation: 'Regulations',
  Checklist:  'Checklists',
}

function autoPlural() {
  if (form.content_label in PLURAL_MAP) {
    form.content_label_plural = PLURAL_MAP[form.content_label]
  }
}

// ── Logo upload ───────────────────────────────────────
async function handleLogoUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return

  uploadState.value = 'uploading'
  uploadError.value = ''

  try {
    const ext = file.name.split('.').pop()
    const path = `${form.org_id}/logo.${ext}`

    const { error: upErr } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (upErr) throw upErr

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
    form.logo_url = urlData.publicUrl
    uploadState.value = 'done'
  } catch (err) {
    uploadError.value = err.message ?? 'Upload failed.'
    uploadState.value = 'error'
  }

  // Reset the file input so re-uploading the same file works
  e.target.value = ''
}

// ── Save ──────────────────────────────────────────────
async function save() {
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true

  try {
    const payload = {
      org_name:             form.org_name.trim(),
      content_label:        isCustomLabel.value ? (customLabelValue.value.trim() || 'Procedure') : form.content_label,
      content_label_plural: form.content_label_plural.trim() || 'Procedures',
      brand_primary:        form.brand_primary,
      brand_secondary:      form.brand_secondary,
      logo_url:             form.logo_url || null,
      footer_tagline:       form.footer_tagline.trim() || null,
    }

    const { error } = await supabase
      .from('tenants')
      .update(payload)
      .eq('org_id', form.org_id)

    if (error) throw error

    // If the logged-in user belongs to this tenant, apply the changes live
    if (authState.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', authState.user.id)
        .single()

      if (profile?.org_id === form.org_id) {
        setTenant({ ...payload, org_id: form.org_id })
      }
    }

    // Update local tenants list
    const idx = tenants.value.findIndex(t => t.org_id === form.org_id)
    if (idx !== -1) Object.assign(tenants.value[idx], payload)

    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err) {
    saveError.value = err.message ?? 'Save failed. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-branding {
  max-width: 1100px;
}

/* ── Page header ──────────────────────────────────── */
.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 2rem 0;
}

/* ── Editor layout ────────────────────────────────── */
.editor-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* ── Edit panel ───────────────────────────────────── */
.edit-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-divider {
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-top: 1px solid #f3f4f6;
  padding-top: 0.75rem;
  margin-top: 0.25rem;
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

.field-input,
.field-select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.45rem 0.65rem;
  font-size: 0.875rem;
  color: #111827;
  width: 100%;
  background: #fff;
  &:focus { outline: none; border-color: var(--brand-primary); box-shadow: 0 0 0 2px rgba(26,39,68,0.1); }
}

.field-hint {
  font-size: 0.72rem;
  color: #9ca3af;
  margin: 0;
  code {
    font-size: 0.7rem;
    background: #f3f4f6;
    padding: 0 3px;
    border-radius: 3px;
  }
}

.field-error {
  font-size: 0.75rem;
  color: #dc2626;
  margin: 0;
}

.label-row {
  display: flex;
  gap: 0.5rem;
  .field-select { flex: 1; }
  .field-input  { flex: 1; }
}

/* Color inputs */
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
  border: 1px solid #d1d5db;
}

.color-text { flex: 1; font-family: monospace; }

/* Logo */
.logo-preview-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.25rem;
}

.logo-thumb {
  height: 32px;
  max-width: 100px;
  object-fit: contain;
}

.btn-remove-logo {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  &:hover { text-decoration: underline; }
}

.upload-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.85rem;
  font-size: 0.8rem;
  color: #374151;
  cursor: pointer;
  width: 100%;
  &:hover { background: #f3f4f6; border-color: #9ca3af; }
}

.upload-input {
  display: none;
}

/* Save row */
.form-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
}

.btn-reset {
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
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.save-success {
  font-size: 0.8rem;
  color: #059669;
  text-align: right;
}

/* ── Preview panel ────────────────────────────────── */
.preview-panel {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  /* Scoped CSS variables — do NOT bleed to document root */
  --p-primary:   #1a2744;
  --p-secondary: #2d3f6b;
}

.preview-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
  margin: 0 0 0.25rem;
}

/* Mini header */
.preview-header {
  background: #fff;
  border-bottom: 3px solid var(--p-primary);
  border-radius: 7px 7px 0 0;
  padding: 0.6rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.preview-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-logo {
  height: 22px;
  max-width: 60px;
  object-fit: contain;
}

.preview-logo-placeholder {
  width: 28px;
  height: 22px;
  background: var(--p-primary);
  border-radius: 4px;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.03em;
}

.preview-org-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.preview-nav-links {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.preview-nav-link {
  font-size: 0.7rem;
  color: #6b7280;
  cursor: default;
}

.preview-nav-link.active {
  color: var(--p-primary);
  font-weight: 600;
}

/* Card area */
.preview-card-area {
  background: #fff;
  border-radius: 0 0 7px 7px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-section-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin: 0 0 0.25rem;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  padding: 0.6rem 0.75rem;
  cursor: default;
}

.preview-card-dim {
  opacity: 0.55;
}

.preview-card-num {
  font-size: 0.62rem;
  font-weight: 700;
  color: #fff;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}

.preview-card-body { flex: 1; overflow: hidden; }

.preview-card-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-card-chapter {
  font-size: 0.65rem;
  color: #9ca3af;
  margin: 0;
}

.preview-card-chevron {
  color: #d1d5db;
  font-size: 1rem;
  flex-shrink: 0;
}

/* Mini detail header */
.preview-detail-header {
  border-radius: 7px;
  padding: 0.85rem 1rem;
  color: #fff;
}

.preview-detail-breadcrumb {
  font-size: 0.62rem;
  opacity: 0.7;
  margin: 0 0 0.25rem;
}

.preview-detail-title {
  font-size: 0.8rem;
  font-weight: 700;
  margin: 0 0 0.6rem;
}

.preview-detail-actions {
  display: flex;
  gap: 0.5rem;
}

.preview-btn {
  font-size: 0.62rem;
  background: rgba(255,255,255,0.18);
  border-radius: 5px;
  padding: 2px 8px;
  cursor: default;
}

.preview-btn-outline {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.5);
}

/* Footer */
.preview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.25rem 0;
  font-size: 0.65rem;
  color: #9ca3af;
}
</style>
