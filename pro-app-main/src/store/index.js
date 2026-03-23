import { createStore } from 'vuex';

export default createStore({
  state: {
    jwt: null, // State to hold the JWT token
    isLoggedIn: false, //does this need to be here?
  },
  getters: {
    isLoggedIn: state => !!state.jwt,
  },
  mutations: {
    login(state, token) {
      state.jwt = token; // Mutation to update the JWT token
      state.isLoggedIn = true; 
    },
    logout(state) {
      state.jwt = null;
      state.isLoggedIn = false;
    },
  },
  actions: {
    login({ commit }, token) {
      commit('login', token);
      // Actions can be added here to handle asynchronous operations
    },
    logout({ commit }) {
      commit('logout');
    },
  },

});

