<template>
  <div class="admin-main-roles">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="mb-0">Main Roles</h2>
      <button class="btn btn-primary btn-sm" @click="openForm()">+ Add Role</button>
    </div>

    <div class="mb-3">
      <select v-model="filterProcedureId" class="form-select form-select-sm" style="max-width:320px">
        <option value="">— All Procedures —</option>
        <option v-for="p in procedures" :key="p.id" :value="p.id">
          {{ p.attributes.procedure_number }} {{ p.attributes.name }}
        </option>
      </select>
    </div>

    <div v-if="alert.msg" :class="`alert alert-${alert.type} alert-dismissible`">
      {{ alert.msg }}
      <button type="button" class="btn-close" @click="alert.msg = ''"></button>
    </div>

    <div class="table-responsive">
      <table class="table table-hover bg-white rounded shadow-sm">
        <thead class="table-light">
          <tr>
            <th>Role Title</th>
            <th>Procedure</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredRoles" :key="r.id">
            <td>{{ r.attributes.role_title }}</td>
            <td><small class="text-muted">{{ procNumById[r.attributes.procedure_id] }}</small></td>
            <td class="text-end">
              <button class="btn btn-outline-secondary btn-sm me-1" @click="openForm(r)">Edit</button>
              <button class="btn btn-outline-danger btn-sm" @click="confirmDelete(r)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-panel">
        <h4 class="mb-3">{{ editing ? 'Edit' : 'Add' }} Main Role</h4>
        <form @submit.prevent="saveRecord">
          <div class="mb-2">
            <label class="form-label form-label-sm">Procedure</label>
            <select v-model="form.procedure_id" class="form-select form-select-sm" required>
              <option value="">— select —</option>
              <option v-for="p in procedures" :key="p.id" :value="p.id">
                {{ p.attributes.procedure_number }} {{ p.attributes.name }}
              </option>
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label form-label-sm">Role Title</label>
            <input v-model="form.role_title" class="form-control form-control-sm" list="role-suggestions" required />
            <datalist id="role-suggestions">
              <option value="Police Officer"/>
              <option value="Officer in Charge"/>
              <option value="Member"/>
              <option value="Court Officer"/>
              <option value="Custodial Officer"/>
              <option value="Supervisor"/>
              <option value="Unit Commander"/>
              <option value="Investigating Officer"/>
            </datalist>
          </div>
          <div class="mb-2">
            <label class="form-label form-label-sm">Description <small class="text-muted">(use • for bullets)</small></label>
            <textarea v-model="form.descriptionText" class="form-control form-control-sm" rows="6"></textarea>
          </div>
          <div class="d-flex gap-2 justify-content-end mt-3">
            <button type="button" class="btn btn-secondary btn-sm" @click="showForm = false">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { textToBlocks, blocksToText } from '@/utils/textToBlocks';

export default {
  name: 'AdminMainRoles',
  data() {
    return {
      roles: [],
      procedures: [],
      filterProcedureId: '',
      showForm: false,
      editing: null,
      saving: false,
      alert: { msg: '', type: 'success' },
      form: { procedure_id: '', role_title: '', descriptionText: '' },
    };
  },
  computed: {
    filteredRoles() {
      if (!this.filterProcedureId) return this.roles;
      return this.roles.filter(r => r.attributes.procedure_id === this.filterProcedureId);
    },
    procNumById() {
      const map = {};
      this.procedures.forEach(p => { map[p.id] = p.attributes.procedure_number; });
      return map;
    },
  },
  async mounted() {
    await this.load();
  },
  methods: {
    async load() {
      const [rRes, pRes] = await Promise.all([api.getMainRoles(), api.getProcedures()]);
      this.roles      = rRes.data || [];
      this.procedures = pRes.data || [];
    },
    openForm(record) {
      this.editing = record || null;
      if (record) {
        this.form = { procedure_id: record.attributes.procedure_id, role_title: record.attributes.role_title, descriptionText: blocksToText(record.attributes.description) };
      } else {
        this.form = { procedure_id: this.filterProcedureId || '', role_title: '', descriptionText: '' };
      }
      this.showForm = true;
    },
    async saveRecord() {
      this.saving = true;
      try {
        const payload = { procedure_id: this.form.procedure_id, role_title: this.form.role_title, description: textToBlocks(this.form.descriptionText) };
        if (this.editing) {
          await api.updateMainRole(this.editing.id, payload);
        } else {
          await api.createMainRole(payload);
        }
        this.showForm = false;
        this.alert = { msg: 'Saved successfully.', type: 'success' };
        await this.load();
      } catch (e) {
        this.alert = { msg: e.message || 'Save failed.', type: 'danger' };
      } finally {
        this.saving = false;
      }
    },
    async confirmDelete(record) {
      if (!confirm(`Delete role "${record.attributes.role_title}"?`)) return;
      try {
        await api.deleteMainRole(record.id);
        this.alert = { msg: 'Deleted.', type: 'success' };
        await this.load();
      } catch (e) {
        this.alert = { msg: e.message || 'Delete failed.', type: 'danger' };
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/admin-shared.scss';
</style>
