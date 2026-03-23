<template>

  <div class="buttons-row container py-4">
    <!-- Left-aligned buttons -->
    <div class="left-buttons">
      <button @click="goBack" class="btn btn-secondary btn-sm ">Back</button>
    </div>
  </div>

  <!-- Displaying CONTACT US PAGE -->

  <div class="contact-container">
      <!-- Only render if contactContent -->
      <div v-if="contactContent">
        <h1>{{ contactContent.title }}</h1>

        <!-- Iterate over the description array -->
        <div v-for="(item, index) in contactContent.description" :key="index" class="contact-item">
          <!-- Check if it's a heading -->
          <div v-if="item.type === 'heading'">
            <component :is="'h' + item.level">{{ item.children[0].text }}</component>
          </div>
          
          <!-- Check if it's a paragraph -->
          <div v-if="item.type === 'paragraph'">
            <p>{{ item.children[0].text }}</p>
          </div>

          <!-- Check if it's a list -->
          <div v-else-if="item.type === 'list'">
            <ul v-if="item.format === 'unordered'" class="unordered-list">
              <li v-for="(listItem, i) in item.children" :key="i">
                {{ listItem.children[0].text }}
              </li>
            </ul>
            <ol v-else-if="item.format === 'ordered'" class="ordered-list">
              <li v-for="(listItem, i) in item.children" :key="i">
                {{ listItem.children[0].text }}
              </li>
            </ol>
          </div>

          <!-- Additional checks for other types can go here -->
        </div>
      </div>
      <div class="contact-form container d-flex justify-content-center align-items-center">
      <div class="form-container">
        <h3 class="text-center mb-4">Send Us an Email</h3>
        <form accept-charset="UTF-8" action="https://www.formbackend.com/f/{your-identifier}" method="POST" class="d-block p-3">
          <div class="form-fields">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required>
          </div>

          <div class="form-fields">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>

          <div class="form-fields">
            <label for="message">Message</label>
            <textarea id="message" name="message" required></textarea>
          </div>

          <button type="submit">Send message</button>
        </form>
      </div>
    </div>
  </div>


</template>

<script>
import api from '@/services/api';

export default {
  name: 'ContactView',
  data() {
    return {
      contactContent: null, // To store the Contact Us data
    };
  },
  mounted() {
    this.fetchContactContent();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchContactContent() {
      try {
        const response = await api.getContact();
        this.contactContent = response.data?.attributes || null;
        
      } catch (error) {
        console.error('Error fetching Contact Us content:', error);
      }
    },
  },
};
</script>




<style scoped>
.contact-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.contact-container h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

.contact-item {
  margin-bottom: 1.5rem;
}

.contact-item p {
  margin: 0;
  line-height: 1.5;
  color: #555;
}

.contact-container ul,
.contact-container ol {
  margin-left: 1.5rem;
  color: #555;
}

.contact-container li {
  margin-bottom: 0.5rem;
}

.contact-container ul {
  list-style-type: disc;
}

.contact-container ol {
  list-style-type: decimal;
}

h1 {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  .form-fields {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
    font-size: 0.9rem;
  }

  input[type="text"], input[type="email"], textarea {
    border: 1px solid #ccc;
    font-size: 1rem;
    padding: 6px 10px;
    border-radius: 4px;
    width: 100%; /* Make inputs full-width */
  }

  button[type="submit"] {
    background-color: rgb(67 56 202);
    color: white;
    font-size: 0.8rem;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-weight: 500;
  }

  /* Center the form on the page */
  .contact-page {
    max-width: 500px;
    padding: 1rem;
  }

  .form-container {
    width: 100%; /* Ensure the form takes up 100% of the container */
  }

  /* Flexbox to center the form */
  .vh-100 {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Mobile adjustments */
  @media (max-width: 576px) {
    h1 {
      font-size: 1.25rem;
    }

    .contact-page {
      padding: 0.5rem;
    }
  }
</style>

