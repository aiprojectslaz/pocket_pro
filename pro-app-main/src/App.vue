<script setup>
import HeaderComponent from '@/components/Header.vue';
import OrgBar from '@/components/OrgBar.vue';
import BottomNav from '@/components/BottomNav.vue';
import FooterComponent from '@/components/Footer.vue';
import Modal from '@/components/Modal.vue';
</script>

<template>
  <div class="app-container">
    <HeaderComponent v-if="$route.name !== 'home'" />
    <OrgBar v-if="$route.name !== 'home'" />
    <main class="content">
      <RouterView />
    </main>
    <FooterComponent v-if="$route.name !== 'home'" />
    <BottomNav />
    <!-- Global modal — rendered via Teleport to <body> -->
    <Modal />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}
</style>
