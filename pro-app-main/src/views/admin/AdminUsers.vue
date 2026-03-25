<template>
  <div class="admin-users">

    <!-- Page header -->
    <div class="page-header">
      <h2 class="page-title">Users</h2>
      <button class="btn-primary" @click="openInvite">
        <fa icon="envelope" class="me-1" />Invite user
      </button>
    </div>

    <!-- Toolbar: search + filters -->
    <div class="toolbar" v-if="!loading">
      <input
        v-model="search"
        type="text"
        class="search-input"
        placeholder="Search by name or email…"
      />
      <select v-model="filterOrg" class="filter-select">
        <option value="">All tenants</option>
        <option v-for="t in tenants" :key="t.org_id" :value="t.org_id">
          {{ t.org_name }} ({{ orgUserCount(t.org_id) }})
        </option>
      </select>
      <select v-model="filterRole" class="filter-select">
        <option value="">All roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
      Loading users…
    </div>

    <!-- Empty -->
    <div v-else-if="filteredUsers.length === 0" class="empty-state">
      {{ users.length === 0 ? 'No users found.' : 'No users match your filters.' }}
    </div>

    <!-- Table -->
    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Org</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last login</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id" :class="{ 'row-inactive': !u.is_active }">
            <td>
              <div class="user-cell">
                <span class="user-avatar">{{ initials(u) }}</span>
                <div>
                  <p class="user-name">{{ u.display_name || '—' }}</p>
                  <p class="user-email">{{ u.email }}</p>
                </div>
              </div>
            </td>
            <td>
              <span class="org-badge" :style="orgColor(u.org_id)">{{ u.org_id }}</span>
            </td>
            <td>
              <span class="role-badge" :class="u.is_admin ? 'role-admin' : 'role-user'">
                {{ u.is_admin ? 'Admin' : 'User' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="u.is_active ? 'status-active' : 'status-inactive'">
                {{ u.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="text-muted">{{ formatDate(u.last_sign_in_at) }}</td>
            <td>
              <div class="row-actions">
                <button class="btn-action" @click="openEdit(u)">Edit</button>
                <button class="btn-action" @click="resetPassword(u)" :disabled="!!actionLoading[u.id]">
                  {{ actionLoading[u.id] === 'reset' ? '…' : 'Reset PW' }}
                </button>
                <button
                  class="btn-action"
                  :class="u.is_active ? 'btn-action-warn' : 'btn-action-ok'"
                  @click="toggleActive(u)"
                  :disabled="!!actionLoading[u.id]"
                >
                  {{ actionLoading[u.id] === 'toggle' ? '…' : (u.is_active ? 'Deactivate' : 'Activate') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="table-footer">{{ filteredUsers.length }} of {{ users.length }} users</p>
    </div>

    <!-- ── Toast ───────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast.show" class="toast-msg" :class="toast.type">
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>

    <!-- ── Edit drawer ─────────────────────────────── -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="editDrawer.open" class="drawer-overlay" @click.self="editDrawer.open = false">
          <div class="drawer">
            <div class="drawer-header">
              <span>Edit user</span>
              <button class="drawer-close" @click="editDrawer.open = false">&times;</button>
            </div>
            <form class="drawer-body" @submit.prevent="saveEdit">
              <p class="drawer-email">{{ editForm.email }}</p>

              <div class="field-group">
                <label>Display name</label>
                <input v-model="editForm.display_name" type="text" placeholder="Jane Smith" />
              </div>

              <div class="field-group">
                <label>Tenant</label>
                <select v-model="editForm.org_id" class="form-select-field">
                  <option v-for="t in tenants" :key="t.org_id" :value="t.org_id">
                    {{ t.org_name }}
                  </option>
                </select>
              </div>

              <div class="field-group">
                <label class="toggle-label">
                  <span>Admin role</span>
                  <button
                    type="button"
                    class="toggle"
                    :class="{ 'toggle-on': editForm.is_admin }"
                    @click="editForm.is_admin = !editForm.is_admin"
                    :aria-pressed="editForm.is_admin"
                  >
                    <span class="toggle-thumb"></span>
                  </button>
                </label>
                <p class="field-hint">Admins can access this admin panel.</p>
              </div>

              <div v-if="editError" class="form-error">{{ editError }}</div>

              <div class="drawer-footer">
                <button type="button" class="btn-cancel" @click="editDrawer.open = false">Cancel</button>
                <button type="submit" class="btn-save" :disabled="editSaving">
                  {{ editSaving ? 'Saving…' : 'Save changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Invite drawer ───────────────────────────── -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="inviteDrawer.open" class="drawer-overlay" @click.self="inviteDrawer.open = false">
          <div class="drawer">
            <div class="drawer-header">
              <span>Invite user</span>
              <button class="drawer-close" @click="inviteDrawer.open = false">&times;</button>
            </div>
            <form class="drawer-body" @submit.prevent="sendInvite">

              <div class="field-group">
                <label>Email <span class="req">*</span></label>
                <input v-model="inviteForm.email" type="email" placeholder="user@example.com" required />
              </div>

              <div class="field-group">
                <label>Tenant <span class="req">*</span></label>
                <select v-model="inviteForm.org_id" class="form-select-field" required>
                  <option value="" disabled>Select a tenant…</option>
                  <option v-for="t in tenants" :key="t.org_id" :value="t.org_id">
                    {{ t.org_name }}
                  </option>
                </select>
              </div>

              <div class="field-group">
                <label class="toggle-label">
                  <span>Admin role</span>
                  <button
                    type="button"
                    class="toggle"
                    :class="{ 'toggle-on': inviteForm.is_admin }"
                    @click="inviteForm.is_admin = !inviteForm.is_admin"
                  >
                    <span class="toggle-thumb"></span>
                  </button>
                </label>
              </div>

              <div class="invite-note">
                <fa icon="circle-info" class="me-1" />
                Sends an invite email via Supabase. Requires the
                <code>admin-invite-user</code> Edge Function to be deployed.
              </div>

              <div v-if="inviteError" class="form-error">{{ inviteError }}</div>

              <div class="drawer-footer">
                <button type="button" class="btn-cancel" @click="inviteDrawer.open = false">Cancel</button>
                <button type="submit" class="btn-save" :disabled="inviteSaving">
                  {{ inviteSaving ? 'Sending…' : 'Send invite' }}
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
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// ── State ────────────────────────────────────────────
const loading    = ref(true)
const users      = ref([])
const tenants    = ref([])
const search     = ref('')
const filterOrg  = ref('')
const filterRole = ref('')
const actionLoading = reactive({})   // { [userId]: 'reset' | 'toggle' }

const editSaving  = ref(false)
const inviteSaving = ref(false)
const editError   = ref('')
const inviteError = ref('')

const editDrawer   = reactive({ open: false, userId: null })
const inviteDrawer = reactive({ open: false })

const editForm = reactive({ email: '', display_name: '', org_id: '', is_admin: false })
const inviteForm = reactive({ email: '', org_id: '', is_admin: false })

const toast = reactive({ show: false, message: '', type: 'toast-success' })

// ── Helpers ──────────────────────────────────────────
function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

function initials(u) {
  if (u.display_name) return u.display_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return u.email?.[0]?.toUpperCase() ?? '?'
}

function orgColor(org_id) {
  const t = tenants.value.find(t => t.org_id === org_id)
  return t ? { background: t.brand_primary } : {}
}

function orgUserCount(org_id) {
  return users.value.filter(u => u.org_id === org_id).length
}

function showToast(message, type = 'toast-success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

// ── Filtered users ───────────────────────────────────
const filteredUsers = computed(() => {
  const q = search.value.toLowerCase()
  return users.value.filter(u => {
    const matchSearch = !q ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.display_name ?? '').toLowerCase().includes(q)
    const matchOrg  = !filterOrg.value  || u.org_id === filterOrg.value
    const matchRole = !filterRole.value ||
      (filterRole.value === 'admin' ? u.is_admin : !u.is_admin)
    return matchSearch && matchOrg && matchRole
  })
})

// ── Load data ────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    const [{ data: rows }, { data: tRows }] = await Promise.all([
      supabase.rpc('admin_list_users'),
      supabase.from('tenants').select('org_id, org_name, brand_primary').order('org_name'),
    ])
    users.value   = rows  ?? []
    tenants.value = tRows ?? []
  } finally {
    loading.value = false
  }
}

onMounted(load)

// ── Edit ─────────────────────────────────────────────
function openEdit(u) {
  editError.value = ''
  Object.assign(editForm, {
    email:        u.email,
    display_name: u.display_name ?? '',
    org_id:       u.org_id,
    is_admin:     u.is_admin,
  })
  editDrawer.userId = u.id
  editDrawer.open   = true
}

async function saveEdit() {
  editError.value = ''
  editSaving.value = true
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editForm.display_name.trim() || null,
        org_id:       editForm.org_id,
        is_admin:     editForm.is_admin,
      })
      .eq('id', editDrawer.userId)

    if (error) throw error
    editDrawer.open = false
    showToast('User updated.')
    await load()
  } catch (err) {
    editError.value = err.message ?? 'Save failed.'
  } finally {
    editSaving.value = false
  }
}

// ── Toggle active ─────────────────────────────────────
async function toggleActive(u) {
  actionLoading[u.id] = 'toggle'
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !u.is_active })
      .eq('id', u.id)

    if (error) throw error
    showToast(u.is_active ? 'User deactivated.' : 'User activated.')
    await load()
  } catch (err) {
    showToast(err.message ?? 'Action failed.', 'toast-error')
  } finally {
    delete actionLoading[u.id]
  }
}

// ── Reset password ────────────────────────────────────
async function resetPassword(u) {
  actionLoading[u.id] = 'reset'
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(u.email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) throw error
    showToast(`Password reset email sent to ${u.email}.`)
  } catch (err) {
    showToast(err.message ?? 'Reset failed.', 'toast-error')
  } finally {
    delete actionLoading[u.id]
  }
}

// ── Invite ────────────────────────────────────────────
function openInvite() {
  inviteError.value = ''
  Object.assign(inviteForm, { email: '', org_id: '', is_admin: false })
  inviteDrawer.open = true
}

async function sendInvite() {
  inviteError.value = ''
  inviteSaving.value = true
  try {
    const { error } = await supabase.functions.invoke('admin-invite-user', {
      body: {
        email:    inviteForm.email.trim(),
        org_id:   inviteForm.org_id,
        is_admin: inviteForm.is_admin,
      },
    })
    if (error) throw error
    inviteDrawer.open = false
    showToast(`Invite sent to ${inviteForm.email}.`)
    await load()
  } catch (err) {
    inviteError.value = (err.message ?? 'Invite failed.')
      + ' Make sure the admin-invite-user Edge Function is deployed.'
  } finally {
    inviteSaving.value = false
  }
}
</script>

<style scoped>
.admin-users { max-width: 1000px; }

/* ── Header ───────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}
.page-title { font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0; }

.btn-primary {
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

/* ── Toolbar ──────────────────────────────────────── */
.toolbar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.45rem 0.75rem;
  font-size: 0.875rem;
  &:focus { outline: none; border-color: var(--brand-primary); }
}

.filter-select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.45rem 0.65rem;
  font-size: 0.875rem;
  background: #fff;
  color: #374151;
  cursor: pointer;
  &:focus { outline: none; border-color: var(--brand-primary); }
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
  padding: 0.6rem 1rem;
  color: #6b7280;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: #f9fafb; }
.row-inactive td { opacity: 0.5; }

.table-footer {
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: right;
  padding: 0.5rem 1rem;
  border-top: 1px solid #f3f4f6;
  margin: 0;
}

/* ── User cell ────────────────────────────────────── */
.user-cell { display: flex; align-items: center; gap: 0.65rem; }
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--brand-primary);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-name  { font-weight: 500; color: #111827; margin: 0; font-size: 0.875rem; }
.user-email { color: #6b7280; margin: 0; font-size: 0.78rem; }

.org-badge {
  display: inline-block;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.role-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}
.role-admin { background: rgba(220,38,38,0.1); color: #dc2626; }
.role-user  { background: #f3f4f6; color: #6b7280; }

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}
.status-active   { background: #dcfce7; color: #166534; }
.status-inactive { background: #f3f4f6; color: #9ca3af; }

.text-muted { color: #6b7280; }

/* ── Row actions ──────────────────────────────────── */
.row-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.btn-action {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  border-radius: 5px;
  padding: 3px 9px;
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #f3f4f6; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.btn-action-warn  { color: #d97706; border-color: rgba(217,119,6,0.3); &:hover { background: rgba(217,119,6,0.06); } }
.btn-action-ok    { color: #16a34a; border-color: rgba(22,163,74,0.3);  &:hover { background: rgba(22,163,74,0.06); } }

/* ── Toast ────────────────────────────────────────── */
.toast-msg {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  padding: 0.65rem 1.1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 4px 16px rgba(0,0,0,0.14);
}
.toast-success { background: #111827; color: #fff; }
.toast-error   { background: #dc2626; color: #fff; }

.toast-enter-active, .toast-leave-active { transition: opacity 0.2s, transform 0.2s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }

/* ── Drawer shared ────────────────────────────────── */
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
  width: 380px;
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
  background: none; border: none; font-size: 1.4rem;
  color: #9ca3af; cursor: pointer; line-height: 1;
  &:hover { color: #374151; }
}
.drawer-body {
  flex: 1; overflow-y: auto; padding: 1.25rem;
  display: flex; flex-direction: column; gap: 1rem;
}
.drawer-email { font-size: 0.85rem; color: #6b7280; margin: 0; }
.drawer-footer {
  display: flex; justify-content: flex-end; gap: 0.5rem;
  padding-top: 0.5rem; border-top: 1px solid #f3f4f6; margin-top: auto;
}
.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-group label { font-size: 0.8rem; font-weight: 600; color: #374151; }
.req { color: #dc2626; }
.field-hint { font-size: 0.72rem; color: #9ca3af; margin: 0; }
.field-group input, .form-select-field {
  border: 1px solid #d1d5db; border-radius: 6px;
  padding: 0.45rem 0.65rem; font-size: 0.875rem; color: #111827; width: 100%;
  background: #fff;
  &:focus { outline: none; border-color: var(--brand-primary); box-shadow: 0 0 0 2px rgba(26,39,68,0.1); }
}

/* ── Toggle switch ────────────────────────────────── */
.toggle-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  justify-content: space-between;
}
.toggle {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: #d1d5db;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
  padding: 0;
}
.toggle-on { background: var(--brand-primary); }
.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  display: block;
}
.toggle-on .toggle-thumb { transform: translateX(18px); }

/* ── Invite note ──────────────────────────────────── */
.invite-note {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  padding: 0.65rem 0.85rem;
  font-size: 0.8rem;
  color: #92400e;
  code { font-size: 0.78rem; background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 3px; }
}

/* ── Form error ───────────────────────────────────── */
.form-error {
  background: #fef2f2; border: 1px solid #fecaca;
  color: #dc2626; border-radius: 6px;
  padding: 0.5rem 0.75rem; font-size: 0.8rem;
}

/* ── Drawer slide ─────────────────────────────────── */
.drawer-enter-active, .drawer-leave-active { transition: transform 0.22s ease; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

.btn-cancel {
  background: #fff; border: 1px solid #d1d5db; color: #374151;
  border-radius: 6px; padding: 0.45rem 1rem; font-size: 0.875rem; cursor: pointer;
  &:hover { background: #f9fafb; }
}
.btn-save {
  background: var(--brand-primary); color: #fff; border: none;
  border-radius: 6px; padding: 0.45rem 1.1rem; font-size: 0.875rem;
  font-weight: 600; cursor: pointer;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>
