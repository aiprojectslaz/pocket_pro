<template>
  <!-- Displaying Terms & Conditions PAGE -->
  <div class="terms-container">
    <!-- Only render if termsContent -->
    <div v-if="termsContent">
      <h1 class="terms-title">{{ termsContent.title }}</h1>

      <!-- Iterate over the description array -->
      <div v-for="(item, index) in termsContent.description" :key="index">
        <!-- Check if it's a heading -->
        <div v-if="item.type === 'heading'">
          <component :is="'h' + item.level" class="terms-heading">{{ item.children[0].text }}</component>
        </div>

        <!-- Check if it's a paragraph -->
        <div v-if="item.type === 'paragraph'">
          <p class="terms-paragraph">{{ item.children[0].text }}</p>
        </div>

        <!-- Check if it's a list -->
        <div v-else-if="item.type === 'list'">
          <ul v-if="item.format === 'unordered'" class="terms-list">
            <li v-for="(listItem, i) in item.children" :key="i">
              {{ listItem.children[0].text }}
            </li>
          </ul>
          <ol v-else-if="item.format === 'ordered'" class="terms-list">
            <li v-for="(listItem, i) in item.children" :key="i">
              {{ listItem.children[0].text }}
            </li>
          </ol>
        </div>

        <!-- Additional checks for other types can go here -->
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'TermsView',
  data() {
    return {
      termsContent: null,
    };
  },
  async mounted() {
    await this.fetchTermsContent();
  },
  methods: {
    async fetchTermsContent() {
      try {
        const response = await api.getTerms();
        this.termsContent = response.data?.attributes || null;
      } catch (error) {
        console.error('Error fetching Terms content:', error);
      }
    },
  },
};
</script>

<style scoped>
.terms-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.terms-title {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.terms-heading {
  margin: 20px 0;
  color: #444;
}

.terms-paragraph {
  margin: 15px 0;
  line-height: 1.6;
  color: #555;
}

.terms-list {
  margin: 15px 0;
  padding-left: 20px;
}

.terms-list li {
  margin-bottom: 10px;
  color: #666;
}
</style>
