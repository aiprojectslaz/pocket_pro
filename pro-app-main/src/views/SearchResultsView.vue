<template>
  <div>
    <SearchBar @search="filterProcedures" />
    <div v-if="filteredProcedures.length">
      <div v-for="procedure in filteredProcedures" :key="procedure.id">
        {{ procedure.procedure_name }} ({{ procedure.procedure_number }})
      </div>
    </div>
    <div v-else>
      No procedures found.
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'SearchResultsView',
  methods: {
    async fetchProcedures() {
      try {
        const response = await api.getProcedures();
        this.procedures = response.data;
        this.filteredProcedures = this.procedures;
      } catch (error) {
        console.error(error);
      }
    },
    extractTextFromArray(array) {
      return array.map(item => {
        if (item.children && item.children.length > 0) {
          return item.children.map(child => child.text).join(' ');
        }
        return '';
      }).join(' ');
    },
    filterProcedures(query) {
      const lowerQuery = query.toLowerCase();

      this.filteredProcedures = this.procedures.filter((procedure) => {
        // Check if procedure_name or procedure_number matches the query
        const nameMatches = procedure.name.toLowerCase().includes(lowerQuery);
        const numberMatches = procedure.procedure_number.toLowerCase().includes(lowerQuery);

        // Check if procedure_info or rationale matches the query
        const infoMatches = procedure.procedure_info.toLowerCase().includes(lowerQuery);
        const rationaleMatches = procedure.rationale.toLowerCase().includes(lowerQuery);

        // Check appendices for name, title, or description matches
        const appendicesMatch = procedure.appendices.some(appendix => {
          const descriptionText = this.extractTextFromArray(appendix.description);
          return appendix.name.toLowerCase().includes(lowerQuery) ||
                appendix.title.toLowerCase().includes(lowerQuery) ||
                descriptionText.toLowerCase().includes(lowerQuery);
        });

        // Check definitions for term and definition matches
        const definitionsMatch = procedure.definitions.some(definition => {
          const definitionText = this.extractTextFromArray(definition.definition);
          return definition.term.toLowerCase().includes(lowerQuery) ||
                definitionText.toLowerCase().includes(lowerQuery);
        });

        // Check sub_procedures for name or description matches
        const subProceduresMatch = procedure.sub_procedures.some(subProcedure => {
          const subDescriptionText = this.extractTextFromArray(subProcedure.description);
          return subProcedure.name.toLowerCase().includes(lowerQuery) ||
                subDescriptionText.toLowerCase().includes(lowerQuery);
        });

        // Return true if any of the fields match the query
        return (
          nameMatches ||
          numberMatches ||
          infoMatches ||
          rationaleMatches ||
          appendicesMatch ||
          definitionsMatch ||
          subProceduresMatch
        );
      });
    }

  }
};
</script>

