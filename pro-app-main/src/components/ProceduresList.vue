<template>
  <div class="procedures-list">
    <h1 class="text-center mb-4">Procedures</h1>
    <ul class="list-unstyled">
      <li v-for="procedure in procedures" :key="procedure.id" class="mb-2">
        <RouterLink
          :to="{ name: 'procedure-item', params: { id: procedure.id } }"
          class="procedure-card d-flex align-items-center text-decoration-none"
        >
          <span class="proc-number-badge me-3">
            {{ procedure.attributes.procedure_number }}
          </span>
          <div class="proc-info flex-grow-1">
            <div class="proc-name">{{ procedure.attributes.name }}</div>
            <div class="proc-chapter">
              {{ procedure.attributes.chapters?.title || '' }}
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 ms-2">
            <span
              v-if="procedure.attributes.status === 'Amended'"
              class="status-badge"
            >Amended</span>
            <span class="chevron">›</span>
          </div>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ProceduresList',
  data() {
    return {
      procedures: []
    }
  },
  async mounted() {
    try {
      const response = await api.getProcedures();
      this.procedures = response.data;
    } catch (error) {
      console.error('There was an error fetching the procedures:', error);
    }
  }
};
</script>

<style scoped lang="scss">
.procedures-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.procedure-card {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: var(--brand-primary);
    box-shadow: 0 2px 6px rgba(26, 39, 68, 0.1);
    text-decoration: none;
    color: inherit;
  }
}

.proc-number-badge {
  background-color: var(--brand-primary);
  color: #fff;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  min-width: 52px;
  text-align: center;
}

.proc-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #212529;
}

.proc-chapter {
  font-size: 0.78rem;
  color: #6c757d;
  margin-top: 2px;
}

.status-badge {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 0.72rem;
  font-weight: 600;
}

.chevron {
  font-size: 1.2rem;
  color: #adb5bd;
}
</style>
