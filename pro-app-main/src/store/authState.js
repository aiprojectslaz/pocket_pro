// src/store/authState.js
// authState.js or equivalent
import { reactive } from 'vue';

export const authState = reactive({
  jwt: localStorage.getItem('jwt') || null,

  get isLoggedIn() {
    return !!this.jwt;
  },

  setJwt(token) {
    this.jwt = token;
    localStorage.setItem('jwt', token); // Update localStorage when JWT changes
  },

  logout() {
    this.jwt = null;
    localStorage.removeItem('jwt'); // Remove JWT from localStorage on logout
  }
});
