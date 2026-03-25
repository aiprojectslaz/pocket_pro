<template>
  <div class="admin-appendices">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="mb-0">Appendices</h2>
      <button class="btn btn-primary btn-sm" @click="openForm()">+ Add Appendix</button>
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
            <th>Name</th>
            <th>Title</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filteredAppendices" :key="a.id">
            <td>{{ a.attributes.name }}</td>
            <td>{{ a.attributes.title }}</td>
            <td>{{ a.attributes.status }}</td>
            <td class="text-end">
              <button class="btn btn-outline-secondary btn-sm me-1" @click="openForm(a)">Edit</button>
              <button class="btn btn-outline-danger btn-sm" @click="confirmDelete(a)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-panel">
        <h4 class="mb-3">{{ editing ? 'Edit' : 'Add' }} Appendix</h4>
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
          <div class="row g-2 mb-2">
            <div class="col-4">
              <label class="form-label form-label-sm">Name (e.g. 01-02 App B)</label>
              <input v-model="form.name" class="form-control form-control-sm" required />
            </div>
            <div class="col-8">
              <label class="form-label form-label-sm">Title</label>
              <input v-model="form.title" class="form-control form-control-sm" />
            </div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-4">
              <label class="form-label form-label-sm">Status</label>
              <select v-model="form.status" class="form-select form-select-sm">
                <option>Active</option>
                <option>Amended</option>
                <option>Archived</option>
              </select>
            </div>
            <div class="col-4">
              <label class="form-label form-label-sm">Issued</label>
              <input type="date" v-model="form.issue_date" class="form-control form-control-sm" />
            </div>
            <div class="col-4">
              <label class="form-label form-label-sm">Replaces</label>
              <input type="date" v-model="form.replaces_date" class="form-control form-control-sm" />
            </div>
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
  name: 'AdminAppendices',
  data() {
    return {
      appendices: [],
      procedures: [],
      filterProcedureId: '',
      showForm: false,
      editing: null,
      saving: false,
      alert: { msg: '', type: 'success' },
      form: { procedure_id: '', name: '', title: '', status: 'Active', issue_date: '', replaces_date: '', descriptionText: '' },
    };
  },
  computed: {
    filteredAppendices() {
      if (!this.filterProcedureId) return this.appendices;
      return this.appendices.filter(a => a.attributes.procedure_id === this.filterProcedureId);
    },
  },
  async mounted() {
    await this.load();
  },
  methods: {
    async load() {
      const [aRes, pRes] = await Promise.all([api.getAppendices(), api.getProcedures()]);
      this.appendices = aRes.data || [];
      this.procedures = pRes.data || [];
    },
    openForm(record) {
      this.editing = record || null;
      if (record) {
        const a = record.attributes;
        this.form = { procedure_id: a.procedure_id, name: a.name, title: a.title || '', status: a.status || 'Active', issue_date: a.issue_date || '', replaces_date: a.replaces_date || '', descriptionText: blocksToText(a.description) };
      } else {
        this.form = { procedure_id: this.filterProcedureId || '', name: '', title: '', status: 'Active', issue_date: '', replaces_date: '', descriptionText: '' };
      }
      this.showForm = true;
    },
    async saveRecord() {
      this.saving = true;
      try {
        const payload = { procedure_id: this.form.procedure_id, name: this.form.name, title: this.form.title, status: this.form.status, issue_date: this.form.issue_date || null, replaces_date: this.form.replaces_date || null, description: textToBlocks(this.form.descriptionText) };
        if (this.editing) {
          await api.updateAppendix(this.editing.id, payload);
        } else {
          await api.createAppendix(payload);
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
      if (!confirm(`Delete appendix "${record.attributes.name}"?`)) return;
      try {
        await api.deleteAppendix(record.id);
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
