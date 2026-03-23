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

    <!-- Copyright or other information -->
    <div class="footer-info text-center">
      <p class="mb-0">&copy; 2024 Procedure App. All rights reserved.</p>
    </div>
  </footer>
</template>


<script>
export default {
  name: 'FooterComponent',
};
</script>

<style scoped lang="scss">
.app-footer {
  border-top: 1px solid #4e4e4e;

  .footer-nav {
    .nav-link {
      &:hover {
        text-decoration: underline;
        color: #f8f9fa; // Light color on hover
      }
    }
  }

  .footer-info {
    p {
      font-size: 0.9rem;
    }
  }
}
</style>
