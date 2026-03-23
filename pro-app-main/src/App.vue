<script setup>
import HeaderComponent from '@/components/Header.vue';
import FooterComponent from '@/components/Footer.vue';
</script>

<template>
  <div class="app-container">
  
    <!-- Header: Could include a logo, navigation links, or other global components -->
    <HeaderComponent />

    <!-- Main content area where routed components will be rendered -->
    <main class="content">
      <RouterView />
    </main>

    <!-- Footer: This is global and typically included across all pages -->
    <FooterComponent />

  </div>
</template>

<style scoped>

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Ensure the container takes at least the full viewport height */
}

.content {
  flex: 1; /* This makes the main content area take up the available space */
}

footer {
  /* Add styling for footer if needed */
}
</style>



