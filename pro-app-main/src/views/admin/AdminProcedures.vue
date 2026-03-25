<template>
  <div class="admin-procedures">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="mb-0">Procedures</h2>
      <button class="btn btn-primary btn-sm" @click="openForm()">+ Add Procedure</button>
    </div>

    <!-- Alert -->
    <div v-if="alert.msg" :class="`alert alert-${alert.type} alert-dismissible`">
      {{ alert.msg }}
      <button type="button" class="btn-close" @click="alert.msg = ''"></button>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover bg-white rounded shadow-sm">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Status</th>
            <th>Issued</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in procedures" :key="p.id">
            <td><span class="badge bg-primary">{{ p.attributes.procedure_number }}</span></td>
            <td>{{ p.attributes.name }}</td>
            <td>{{ p.attributes.status }}</td>
            <td>{{ p.attributes.issue_date }}</td>
            <td class="text-end">
              <button class="btn btn-outline-secondary btn-sm me-1" @click="openForm(p)">Edit</button>
              <button class="btn btn-outline-danger btn-sm" @click="confirmDelete(p)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-panel">
        <h4 class="mb-3">{{ editing ? 'Edit' : 'Add' }} Procedure</h4>
        <form @submit.prevent="saveRecord">
          <div class="row g-2 mb-2">
            <div class="col-3">
              <label class="form-label form-label-sm">Number</label>
              <input v-model="form.procedure_number" class="form-control form-control-sm" required />
            </div>
            <div class="col-9">
              <label class="form-label form-label-sm">Name</label>
              <input v-model="form.name" class="form-control form-control-sm" required />
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
            <label class="form-label form-label-sm">Chapter</label>
            <select v-model="form.chapter_id" class="form-select form-select-sm">
              <option value="">— none —</option>
              <option v-for="ch in chapters" :key="ch.id" :value="ch.id">{{ ch.attributes.title }}</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label form-label-sm">Rationale</label>
            <textarea v-model="form.rationale" class="form-control form-control-sm" rows="2"></textarea>
          </div>
          <div class="mb-2">
            <label class="form-label form-label-sm">Supervision</label>
            <textarea v-model="form.supervision" class="form-control form-control-sm" rows="2"></textarea>
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

export default {
  name: 'AdminProcedures',
  data() {
    return {
      procedures: [],
      chapters: [],
      showForm: false,
      editing: null,
      saving: false,
      alert: { msg: '', type: 'success' },
      form: this.blankForm(),
    };
  },
  async mounted() {
    await this.load();
  },
  methods: {
    blankForm() {
      return { procedure_number: '', name: '', status: 'Active', issue_date: '', replaces_date: '', chapter_id: '', rationale: '', supervision: '' };
    },
    async load() {
      const [pRes, cRes] = await Promise.all([api.getProcedures(), api.getChapters()]);
      this.procedures = pRes.data || [];
      this.chapters   = cRes.data || [];
    },
    openForm(record) {
      this.editing = record || null;
      if (record) {
        const a = record.attributes;
        this.form = { procedure_number: a.procedure_number, name: a.name, status: a.status, issue_date: a.issue_date || '', replaces_date: a.replaces_date || '', chapter_id: a.chapter_id || '', rationale: a.rationale || '', supervision: a.supervision || '' };
      } else {
        this.form = this.blankForm();
      }
      this.showForm = true;
    },
    async saveRecord() {
      this.saving = true;
      try {
        const payload = { ...this.form };
        if (!payload.chapter_id) delete payload.chapter_id;
        if (!payload.replaces_date) delete payload.replaces_date;
        if (this.editing) {
          await api.updateProcedure(this.editing.id, payload);
        } else {
          await api.createProcedure(payload);
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
      if (!confirm(`Delete "${record.attributes.procedure_number} ${record.attributes.name}"? This will also delete its sub-procedures, roles, and appendices.`)) return;
      try {
        await api.deleteProcedure(record.id);
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
