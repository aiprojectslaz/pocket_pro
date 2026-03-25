<template>
  <div class="reset-container container mt-5">
    <h2 class="text-center mb-2">Reset password</h2>
    <p class="text-center text-muted mb-4">
      Enter your email and we'll send you a link to reset your password.
    </p>

    <!-- Success state -->
    <div v-if="submitted" class="alert alert-success text-center" role="alert">
      Check your inbox — a reset link has been sent to <strong>{{ email }}</strong>.
      <div class="mt-3">
        <RouterLink to="/login" class="btn btn-sm btn-outline-secondary">Back to login</RouterLink>
      </div>
    </div>

    <!-- Form state -->
    <form v-else @submit.prevent="sendReset" class="p-4 shadow-sm rounded bg-light">
      <div class="form-group mb-4">
        <label for="email" class="form-label">Email address</label>
        <input
          type="email"
          v-model="email"
          id="email"
          class="form-control"
          placeholder="you@example.com"
          required
          :disabled="loading"
        />
      </div>

      <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
        {{ errorMessage }}
      </div>

      <button type="submit" class="btn btn-brand w-100" :disabled="loading">
        {{ loading ? 'Sending…' : 'Send reset link' }}
      </button>

      <div class="text-center mt-3">
        <RouterLink to="/login" class="text-secondary" style="font-size: 0.875rem;">
          Back to login
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase';

export default {
  data() {
    return {
      email: '',
      loading: false,
      submitted: false,
      errorMessage: '',
    };
  },
  methods: {
    async sendReset() {
      this.errorMessage = '';
      this.loading = true;
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(this.email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        this.submitted = true;
      } catch (error) {
        this.errorMessage = error.message || 'Something went wrong. Please try again.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.reset-container {
  max-width: 400px;
  margin: 0 auto;
}

.btn-brand {
  background: var(--brand-primary);
  color: #fff;
  border-color: var(--brand-primary);
  font-size: 1rem;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>
