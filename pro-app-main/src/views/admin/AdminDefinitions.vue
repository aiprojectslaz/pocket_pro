<template>
  <div class="admin-definitions">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="mb-0">Definitions</h2>
      <button class="btn btn-primary btn-sm" @click="openForm()">+ Add Definition</button>
    </div>

    <div v-if="alert.msg" :class="`alert alert-${alert.type} alert-dismissible`">
      {{ alert.msg }}
      <button type="button" class="btn-close" @click="alert.msg = ''"></button>
    </div>

    <div class="table-responsive">
      <table class="table table-hover bg-white rounded shadow-sm">
        <thead class="table-light">
          <tr>
            <th>Term</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in definitions" :key="d.id">
            <td>{{ d.attributes.term }}</td>
            <td class="text-end">
              <button class="btn btn-outline-secondary btn-sm me-1" @click="openForm(d)">Edit</button>
              <button class="btn btn-outline-danger btn-sm" @click="confirmDelete(d)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-panel">
        <h4 class="mb-3">{{ editing ? 'Edit' : 'Add' }} Definition</h4>
        <form @submit.prevent="saveRecord">
          <div class="mb-2">
            <label class="form-label form-label-sm">Term</label>
            <input v-model="form.term" class="form-control form-control-sm" required />
          </div>
          <div class="mb-2">
            <label class="form-label form-label-sm">Definition <small class="text-muted">(use • for bullets)</small></label>
            <textarea v-model="form.definitionText" class="form-control form-control-sm" rows="5" required></textarea>
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
  name: 'AdminDefinitions',
  data() {
    return {
      definitions: [],
      showForm: false,
      editing: null,
      saving: false,
      alert: { msg: '', type: 'success' },
      form: { term: '', definitionText: '' },
    };
  },
  async mounted() {
    await this.load();
  },
  methods: {
    async load() {
      const res = await api.getDefinitions();
      this.definitions = res.data || [];
    },
    openForm(record) {
      this.editing = record || null;
      if (record) {
        this.form = { term: record.attributes.term, definitionText: blocksToText(record.attributes.definition) };
      } else {
        this.form = { term: '', definitionText: '' };
      }
      this.showForm = true;
    },
    async saveRecord() {
      this.saving = true;
      try {
        const payload = { term: this.form.term, definition: textToBlocks(this.form.definitionText) };
        if (this.editing) {
          await api.updateDefinition(this.editing.id, payload);
        } else {
          await api.createDefinition(payload);
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
      if (!confirm(`Delete definition "${record.attributes.term}"?`)) return;
      try {
        await api.deleteDefinition(record.id);
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
