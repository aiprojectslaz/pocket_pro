<template>

  <div class="buttons-row container py-4">
    <!-- Left-aligned buttons -->
    <div class="left-buttons">
      <button @click="goBack" class="btn btn-secondary btn-sm ">Back</button>
    </div>
  </div>
  <!-- Displaying About details -->
  <div class="about-container">
    <!-- Only render if aboutContent exists -->
    <div v-if="aboutContent">
      <h1>{{ aboutContent.title }}</h1>

      <!-- Iterate over the description array -->
      <div v-for="(item, index) in aboutContent.description" :key="index" class="about-item">
        
        <!-- Check if the item is a heading -->
        <div v-if="item.type === 'heading'">
          <component :is="'h' + item.level">{{ item.children[0].text }}</component>
        </div>
        
        <!-- Check if the item is a paragraph -->
        <div v-if="item.type === 'paragraph'">
          <p>{{ item.children[0].text }}</p>
        </div>

        <!-- Check if the item is a list -->
        <div v-else-if="item.type === 'list'">
          
          <!-- Unordered list -->
          <ul v-if="item.format === 'unordered'" class="unordered-list">
            <li v-for="(listItem, i) in item.children" :key="i">
              {{ listItem.children[0].text }}
            </li>
          </ul>

          <!-- Ordered list -->
          <ol v-else-if="item.format === 'ordered'" class="ordered-list">
            <li v-for="(listItem, i) in item.children" :key="i">
              {{ listItem.children[0].text }}
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import api from '@/services/api';

export default {
  name: 'AboutView',
  data() {
    return {
      aboutContent: null, // To store the About Us data
    };
  },
  mounted() {
    this.fetchAboutContent();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchAboutContent() {
      try {
        const response = await axios.get('http://localhost:1337/api/about');
        this.aboutContent = response.data.data.attributes;
        console.log(this.aboutContent);
      } catch (error) {
        console.error('Error fetching About Us content:', error);
      }
    },
  },
};
</script>

<style scoped>
.about-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.about-container h1 {
  font-size: 2em;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.about-item {
  margin-bottom: 20px;
}

.about-item h2,
.about-item h3,
.about-item h4,
.about-item h5,
.about-item h6 {
  color: #555;
  margin-top: 20px;
  margin-bottom: 10px;
}

.about-item p {
  font-size: 1em;
  line-height: 1.6;
  color: #666;
  margin-bottom: 10px;
}

.unordered-list {
  list-style-type: disc;
  padding-left: 20px;
  margin-top: 10px;
  color: #666;
}

.ordered-list {
  list-style-type: decimal;
  padding-left: 20px;
  margin-top: 10px;
  color: #666;
}

.unordered-list li,
.ordered-list li {
  margin-bottom: 5px;
}

.about-item ul ul,
.about-item ol ol {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>

