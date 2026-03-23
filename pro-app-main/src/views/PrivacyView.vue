<template>
  <!-- Displaying PRIVACY POLICY PAGE -->
  <div class="privacy-policy-container">
    <!-- Only render if privacyContent -->
    <div v-if="privacyContent">
      <h1 class="privacy-policy-title">{{ privacyContent.title }}</h1>

      <!-- Iterate over the description array -->
      <div v-for="(item, index) in privacyContent.description" :key="index">
        <!-- Check if it's a heading -->
        <div v-if="item.type === 'heading'">
          <component :is="'h' + item.level" class="privacy-policy-heading">{{ item.children[0].text }}</component>
        </div>
        
        <!-- Check if it's a paragraph -->
        <div v-if="item.type === 'paragraph'">
          <p class="privacy-policy-paragraph">{{ item.children[0].text }}</p>
        </div>

        <!-- Check if it's a list -->
        <div v-else-if="item.type === 'list'">
          <ul v-if="item.format === 'unordered'" class="privacy-policy-list">
            <li v-for="(listItem, i) in item.children" :key="i">
              {{ listItem.children[0].text }}
            </li>
          </ul>
          <ol v-else-if="item.format === 'ordered'" class="privacy-policy-list">
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
import axios from 'axios';
import api from '@/services/api';

export default {
  name: 'PrivacyView',
  data() {
    return {
      privacyContent: null, // To store the Privacy data
    };
  },
  mounted() {
    this.fetchPrivacyContent();
  },
  methods: {
    async fetchPrivacyContent() {
      try {
        const response = await axios.get('http://localhost:1337/api/privacy');
        this.privacyContent = response.data.data.attributes;
      } catch (error) {
        console.error('Error fetching Privacy content:', error);
      }
    },
  },
};
</script>


<style scoped>
.privacy-policy-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.privacy-policy-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #222;
  text-align: center;
}

.privacy-policy-heading {
  margin: 20px 0;
  color: #333;
}

.privacy-policy-paragraph {
  margin: 15px 0;
  line-height: 1.6;
  color: #444;
}

.privacy-policy-list {
  margin: 15px 0;
  padding-left: 20px;
}

.privacy-policy-list li {
  margin-bottom: 10px;
  color: #555;
}
</style>


  