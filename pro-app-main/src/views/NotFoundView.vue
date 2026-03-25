<template>
  <div class="not-found">
    <div class="not-found-card">
      <span class="not-found-code">404</span>
      <h1 class="not-found-title">Page not found</h1>
      <p class="not-found-message">The page you're looking for doesn't exist or has been moved.</p>
      <RouterLink to="/" class="btn btn-brand">Go to home</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-card {
  text-align: center;
  max-width: 400px;
}

.not-found-code {
  display: block;
  font-size: 5rem;
  font-weight: 800;
  color: var(--brand-primary);
  line-height: 1;
  margin-bottom: 0.5rem;
  opacity: 0.15;
}

.not-found-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand-primary);
  margin-bottom: 0.75rem;
}

.not-found-message {
  color: #6b7280;
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
}

.btn-brand {
  background: var(--brand-primary);
  color: #fff;
  border-color: var(--brand-primary);
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
  transition: opacity 0.15s;
}

.btn-brand:hover {
  opacity: 0.88;
  color: #fff;
}
</style>
