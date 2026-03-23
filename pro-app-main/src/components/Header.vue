<template>
<header class="app-header text-white py-2">

<!-- Navbar -->
<nav class="app-header navbar navbar-expand-lg navbar-dark">
  <!-- Container wrapper -->
  <div class="container-fluid">

    <!-- Navbar brand -->
    <RouterLink to="/" class="navbar-brand mt-2 mt-lg-0">
      <img src="@/assets/logos/Logo1_BlueBG_cropped.png" height="40" alt="MDB Logo" loading="lazy" />
    </RouterLink>

    <!-- Search Bar-->
    <div class="search-bar d-flex" v-if="isLoggedIn">
      <input type="text" v-model="searchQuery" @keyup.enter="performSearch" class="form-control me-2" placeholder="Search procedures..."/>
      <a @click="performSearch" class="btn d-flex align-items-center hidden-arrow" href="#" role="button" aria-expanded="false">
        <fa icon="search" inverse/>
      </a>
    </div>
    <!-- Search Bar -->

    <!-- Toggle button -->
    <!-- Menu Icon -->
    <button class="navbar-toggler" type="button" data-mdb-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">

      <!-- Show this dropdown only if the user is logged in -->
      <div class="dropdown" v-if="isLoggedIn">
        <a class="btn dropdown-toggle d-flex align-items-center hidden-arrow" href="#" role="button" id="navbarDropdownMenuAvatar" data-bs-toggle="dropdown" aria-expanded="false">
          <fa icon="bars" inverse />
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
          <li class="dropdown-item"><RouterLink to="/" class="nav-link">Home</RouterLink></li>
          <li class="dropdown-item"><RouterLink to="/procedure-list" class="nav-link">Procedures</RouterLink></li>
          <li class="dropdown-item"><RouterLink to="/bookmarks" class="nav-link">Bookmarks</RouterLink></li>
          <li class="dropdown-item"><RouterLink to="/quizzes" class="nav-link">Quiz</RouterLink></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#">My profile</a></li>
          <li><a class="dropdown-item" href="#">Settings</a></li>
          <li class="dropdown-item" @click="logout"><RouterLink to="/" class="nav-link">Logout</RouterLink></li>
        </ul>
      </div>

      <!-- Show this simple Login link if the user is not logged in -->
      <div v-else class="d-flex align-items-center">
        <RouterLink to="/login" class="nav-link">Login</RouterLink>
      </div>
    </button>
    <!-- Menu Icon -->

    <!-- Collapsible wrapper -->
    <div class="collapse navbar-collapse" id="navbarSupportedContent">

      <!-- Left links -->
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item" v-if="isLoggedIn"><RouterLink to="/" class="nav-link text-white">Home</RouterLink></li>
        <li class="nav-item" v-if="isLoggedIn"><RouterLink to="/procedure-list" class="nav-link text-white">Procedures</RouterLink></li>
        <li class="nav-item" v-if="isLoggedIn"><RouterLink to="/bookmarks" class="nav-link text-white">Bookmarks</RouterLink></li>
        <li class="nav-item" v-if="isLoggedIn"><RouterLink to="/quizzes" class="nav-link text-white">Quiz</RouterLink></li>
        <li class="nav-item" v-if="isLoggedIn"><RouterLink to="/admin" class="nav-link text-white">Dashboard</RouterLink></li>
      </ul>
      <!-- Left links -->

      <!-- Right elements -->
      <div class="d-flex align-items-center">

        <!-- Account Button (Only visible if logged in) -->
        <div v-if="isLoggedIn">
          <div class="dropdown">
            <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
              Account
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
              <li><a class="dropdown-item" href="#">My profile</a></li>
              <li><a class="dropdown-item" href="#">Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li class="dropdown-item" @click="logout">
                <RouterLink to="/" class="nav-link">Logout</RouterLink>
              </li>
            </ul>
          </div>
        </div>

        <!-- Login Link (Only visible if not logged in) -->
        <div v-else class="d-flex align-items-center">
          <RouterLink to="/login" class="nav-link">Login</RouterLink>
        </div>

      </div>
      <!-- Right elements -->
    </div>
    <!-- Collapsible wrapper -->
  </div>
  <!-- Container wrapper -->
</nav>
<!-- Navbar -->

</header>
</template>


<script>
import axios from 'axios';
import qs from 'qs';
import { authState } from '@/store/authState';

export default {
  data() {
    return {
      searchQuery: '',
    };
  },
  computed: {
    isLoggedIn() {
      return authState.isLoggedIn;
    },
  },
  methods: {
    logout() {
      authState.logout();
      this.$store.dispatch('logout');
      this.$router.push('/');
    },
    async performSearch() {
      if (!this.searchQuery.trim()) return;
      try {
        const queryString = qs.stringify({
          filters: {
            $or: [
              { name: { $contains: this.searchQuery } },
              { procedure_number: { $contains: this.searchQuery } },
              { procedure_info: { $contains: this.searchQuery } },
              { rationale: { $contains: this.searchQuery } },
              { 'appendices.title': { $contains: this.searchQuery } },
              { 'appendices.description': { $contains: this.searchQuery } },
              { 'definitions.term': { $contains: this.searchQuery } },
              { 'definitions.definition': { $contains: this.searchQuery } },
              { 'sub_procedures.name': { $contains: this.searchQuery } },
              { 'sub_procedures.description': { $contains: this.searchQuery } },
            ]
          }
        }, { encodeValuesOnly: true });

        const token = localStorage.getItem('jwt');
        const response = await axios.get(
          `http://localhost:1337/api/procedures?populate=definitions,sub_procedures,appendices&${queryString}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        this.$router.push({
          name: 'search-results',
          query: { q: this.searchQuery },
          state: { results: response.data },
        });
      } catch (error) {
        console.error('Error performing search:', error);
      }
    },
  },
};
</script>

<style scoped lang="scss">
  .app-header {
    background-color: #113065;

    .logo img {
      max-height: 75px;
    }

    nav {
      background-color: #113065;
    }

    .main-nav .nav-link {
      margin-right: 15px;
      &:hover {
        text-decoration: underline;
      }
    }

    .search-bar {
      .form-control {
        width: auto;
        margin-right: 10px;
      }

      .btn {
        padding: 0.375rem 0.75rem;
      }
    }
  }
</style>
