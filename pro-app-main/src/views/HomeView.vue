<template>
  <div class="home-page container">
    <div class="d-flex justify-content-center align-items-center">      
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>Welcome to Pocket Procedures</h1>
          <p>Streamlining Procedures, Simplifying Compliance.</p>
          <div class="cta-buttons">
            <button @click="navigateTo('request-a-demo')" class="cta-button primary">Request a Demo</button>
            <button @click="navigateTo('contact')" class="cta-button secondary">Contact Us</button>
          </div>
        </div>
        <img src="@/assets/Hero_image.png" alt="Hero Image" class="hero-image">
      </section>
    </div>

    <div class="d-flex justify-content-center align-items-center">
      <!-- Key Features Section -->
      <section class="features-section">
        <h2>Key Features</h2>
        <div class="features">
          <div class="feature" v-for="feature in features" :key="feature.id">
            <img :src="feature.icon" :alt="feature.title" class="feature-icon">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>
    </div>

      <!-- Responsive Callout Buttons Section 
      <section class="callout-buttons">
        <h2>Explore More</h2>
        <div class="callout-list">
          <div class="callout-item" @click="navigateTo('about')">
            <h3>About Us</h3>
          </div>
          <div class="callout-item" @click="navigateTo('pricing')">
            <h3>Pricing Plans</h3>
          </div>
          <div class="callout-item" @click="navigateTo('testimonials')">
            <h3>Testimonials</h3>
          </div>
          <div class="callout-item" @click="navigateTo('contact')">
            <h3>Contact Us</h3>
          </div>
        </div>
      </section> -->
    
  </div>
</template>

<script>
import icon1 from '@/assets/icons/icon1.png';
import icon2 from '@/assets/icons/icon2.png';
import icon3 from '@/assets/icons/icon3.png';
import icon4 from '@/assets/icons/icon4.png';

export default {
  data() {
    return {
      features: [
        { id: 1, title: "Quick Access", description: "Instant access to procedures and guidelines, ensuring you're always prepared.", icon: '/src/assets/icons/icon1.png' },
        { id: 2, title: "User-Friendly Interface", description: "Simple, intuitive design tailored for law enforcement officers.", icon: '/src/assets/icons/icon2.png' },
        { id: 3, title: "Bookmark Essentials", description: "Save crucial procedures and revisit them whenever you need.", icon: '/src/assets/icons/icon3.png' },
        { id: 4, title: "Practice Quizzes: ", description: "Test your knowledge with quizzes and track your progress.", icon: '/src/assets/icons/icon4.png' }
      ]
    };
  },
  methods: {
    navigateTo(page) {
      this.$router.push({ name: page });
    }
  }
};
</script>

<style scoped lang="scss">
.home-page {
  padding: 20px;

  /* Hero Section */
  .hero-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f5f5f5;
    padding: 40px;
    border-radius: 10px;

    .hero-content {
      max-width: 50%;

      h1 {
        font-size: 2.5rem;
        margin-bottom: 10px;
      }

      p {
        font-size: 1.25rem;
        margin-bottom: 20px;
      }

      .cta-buttons {
        display: flex;
        gap: 15px;

        .cta-button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;

          &.primary {
            background-color: #007bff;
            color: white;
          }

          &.secondary {
            background-color: #6c757d;
            color: white;
          }
        }
      }
    }

    .hero-image {
      max-width: 40%;
      //border-radius: 10px;
    }
  }

  /* Key Features Section */
  .features-section {
    margin-top: 50px;

    h2 {
      text-align: center;
      margin-bottom: 30px;
      font-size: 2rem;
    }

    .features {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;

      .feature {
        max-width: 200px;
        text-align: center;

        .feature-icon {
          max-width: 100px;
          margin-bottom: 15px;
        }

        h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        p {
          font-size: 1rem;
          color: #666;
        }
      }
    }
  }

  /* Callout Buttons Section */
  .callout-buttons {
    margin-top: 50px;

    h2 {
      text-align: center;
      margin-bottom: 30px;
      font-size: 2rem;
    }

    .callout-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;

      .callout-item {
        background-color: #f5f5f5;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #007bff;
          color: white;
        }

        h3 {
          font-size: 1.25rem;
        }
      }
    }
  }
}
</style>
