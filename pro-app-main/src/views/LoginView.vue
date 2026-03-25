<template>
<div class="buttons-row container py-4">
  <div class="left-buttons">
    <button @click="goBack" class="btn btn-secondary btn-sm">Back</button>
  </div>
</div>
  <div class="login-container container mt-5">
    <h2 class="text-center mb-4">Account Login</h2>
    <form @submit.prevent="loginUser" class="p-4 shadow-sm rounded bg-light">

      <!-- Email Field -->
      <div class="form-group mb-3">
        <label for="email" class="form-label">Email:</label>
        <input type="email" v-model="email" id="email" class="form-control" placeholder="Enter your email" required>
      </div>

      <!-- Password Field -->
      <div class="form-group mb-4">
        <label for="password" class="form-label">Password:</label>
        <input
          type="password"
          v-model="password"
          id="password"
          class="form-control"
          placeholder="Enter your password"
          required>
      </div>

      <!-- 2 column grid layout for inline styling -->
      <div class="row mb-4">
        <div class="col d-flex justify-content-center">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="form1Example3" checked />
            <label class="form-check-label" for="form1Example3"> Remember me </label>
          </div>
        </div>
        <div class="col">
          <a href="#!">Forgot password?</a>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
        {{ errorMessage }}
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn btn-primary w-100">Sign In</button>
    </form>

    <!-- Register Link -->
    <div class="register-container text-center mt-3">
      <RouterLink to="/register" class="text-primary">Don't have an account? Register</RouterLink>
    </div>
  </div>
</template>


<script>
import { authState } from '@/store/authState';
import { supabase } from '@/lib/supabase';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async loginUser() {
      this.errorMessage = '';
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password,
        });

        if (error) throw error;

        authState.session = data.session;
        localStorage.setItem('jwt', data.session.access_token);
        this.$store.dispatch('login', data.session.access_token);
        this.$router.push('/procedure-list');
      } catch (error) {
        this.errorMessage = 'Login failed. Please check your credentials and try again.';
      }
    },
  },
};
</script>


<style scoped lang="scss">
.login-container {
  max-width: 400px;
  margin: 0 auto;

  .form-group {
    margin-bottom: 1rem;
  }

  .btn {
    font-size: 1.2rem;
  }

  .register-container {
    margin-top: 1rem;
    a {
      text-decoration: none;
    }
  }
}
</style>
