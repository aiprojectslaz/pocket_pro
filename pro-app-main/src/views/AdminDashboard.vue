<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <nav>
      <ul>
        <li><router-link to="/admin/content">Manage Content</router-link></li>
        <li><router-link to="/admin/quizzes">Create Quizzes</router-link></li>
        <li><router-link to="/admin/users">Manage Users</router-link></li>
        <li><router-link to="/admin/stats">Check Stats</router-link></li>
      </ul>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  computed: {
    isAdmin() {
      // Assuming you have a way to check if the user is an admin
      const authState = JSON.parse(localStorage.getItem('authState'));
      return authState && authState.isAdmin;
    }
  },
  beforeMount() {
    if (!this.isAdmin) {
      this.$router.push('/'); // Redirect to home if not admin
    }
  }
}
</script>

<style scoped>
/* Add your styles here */
.admin-dashboard {
  padding: 20px;
}
nav ul {
  list-style-type: none;
  padding: 0;
}
nav li {
  margin: 10px 0;
}
</style>
