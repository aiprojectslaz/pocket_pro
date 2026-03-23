<template>
  <div class="procedures-list">
    <h1 class="text-center mb-4">Procedures</h1>
    <ul class="list-unstyled">
      <li v-for="procedure in procedures" :key="procedure.id" class="mb-3">
        <RouterLink :to="{ name: 'procedure-item', params: { id: procedure.id } }" class="d-block p-3 text-decoration-none text-dark bg-light rounded hover-effect">
          {{ procedure.attributes.procedure_number }} {{ procedure.attributes.name }}
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
@import "bootstrap/scss/bootstrap";

.procedures-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  
  .hover-effect {
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: lighten($gray-200, 10%);
    }
  }
}

@media (max-width: 576px) {
  h1 {
    font-size: 1.25rem;
  }

  .procedures-list {
    padding: 0.5rem;
  }

  .hover-effect {
    padding: 0.75rem;
  }
}
</style>