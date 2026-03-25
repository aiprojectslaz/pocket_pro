<template>
  <footer class="app-footer bg-dark text-light py-3">

    <!-- Secondary navigation links -->
    <nav class="footer-nav mb-3">
      <ul class="nav justify-content-center">
        <li class="nav-item">
          <RouterLink class="nav-link text-light" to="/contact">Contact Us</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link text-light" to="/about">About</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link text-light" to="/terms">Terms & Conditions</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link text-light" to="/privacy">Privacy Policy</RouterLink>
        </li>
      </ul>
    </nav>

    <div class="footer-info text-center">
      <p class="footer-tagline mb-1">{{ footerTagline }}</p>
      <p class="mb-0 footer-copy">
        &copy; {{ year }} Pocket Procedures. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useTenant } from '@/composables/useTenant'

const { tenant } = useTenant()
const footerTagline = computed(() => tenant.value?.footer_tagline ?? 'Pocket Procedures')
const year = new Date().getFullYear()
</script>

<style scoped lang="scss">
.app-footer {
  border-top: 1px solid #4e4e4e;

  .footer-nav .nav-link:hover {
    text-decoration: underline;
    color: #f8f9fa;
  }

  .footer-tagline {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .footer-copy {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.45);
  }
}
</style>
