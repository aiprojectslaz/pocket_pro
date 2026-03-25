<template>
  <div class="procedures-list">
    <h1 class="mb-4">{{ contentLabelPlural }}</h1>
    <ul class="list-unstyled procedure-cards">
      <li v-for="procedure in procedures" :key="procedure.id">
        <RouterLink
          :to="{ name: 'procedure-item', params: { id: procedure.id } }"
          class="procedure-card"
        >
          <!-- Number badge -->
          <span class="proc-number-badge">{{ procedure.attributes.procedure_number }}</span>

          <!-- Name + chapter -->
          <div class="proc-meta">
            <span class="proc-name">{{ procedure.attributes.name }}</span>
            <span class="proc-chapter" v-if="procedure.attributes.chapter?.title">
              {{ procedure.attributes.chapter.title }}
            </span>
          </div>

          <!-- Status badge -->
          <span
            v-if="procedure.attributes.status === 'Amended'"
            class="proc-status-badge"
          >Amended</span>

          <!-- Chevron -->
          <fa icon="chevron-right" class="proc-chevron" />
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '@/services/api';
import { useTenant } from '@/composables/useTenant';

export default {
  name: 'ProceduresList',
  setup() {
    const { contentLabelPlural } = useTenant();
    return { contentLabelPlural };
  },
  data() {
    return {
      procedures: []
    };
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
  padding: 1.5rem 1rem;

  h1 {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--brand-primary);
  }
}

.procedure-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.procedure-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: var(--brand-primary-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    color: inherit;
  }
}

.proc-number-badge {
  flex-shrink: 0;
  background: var(--brand-primary);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  min-width: 3.5rem;
  text-align: center;
}

.proc-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.proc-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.proc-chapter {
  font-size: 0.75rem;
  color: #6b7280;
}

.proc-status-badge {
  flex-shrink: 0;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #fcd34d;
}

.proc-chevron {
  flex-shrink: 0;
  color: #9ca3af;
  font-size: 0.75rem;
}

@media (max-width: 576px) {
  .procedures-list {
    padding: 1rem 0.75rem;
  }

  .proc-name {
    font-size: 0.875rem;
  }
}
</style>
