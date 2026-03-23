//import './assets/main.css'

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Ensure this path is correct
import store from './store'; // Import the Vuex store
// imporing bootstrap and custom sass
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/custom.scss';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import 'vue-multiselect/dist/vue-multiselect.min.css'; // Optionally import the CSS for styling


library.add(fas);

import { authState } from './store/authState';
authState.init(); // Sync Supabase session on startup

const app = createApp(App);
//console.log('Router instance:', router); // Check if router is correctly instantiated
app.use(store); // Use the store
app.use(router);
app.component('fa', FontAwesomeIcon);
app.mount('#app');