<template>
<div class="buttons-row container py-4">
  <!-- Left-aligned buttons -->
  <div class="left-buttons">
    <button @click="goBack" class="btn btn-secondary btn-sm ">Back</button>
  </div>
</div>
<div class="bookmarks-content container py-4">
  <h1 class="text-center mb-4">My Bookmarks</h1>
    <div v-if="bookmarks.length === 0">
      <p>No bookmarks yet. Start bookmarking {{ contentLabelPlural.toLowerCase() }} to see them here.</p>
    </div>
    <div v-else>
      <div class="bookmarked-procedures">
        <div v-for="bookmark in bookmarks" :key="bookmark.id" class="card bookmark-item">
          <!-- RouterLink with custom class to remove link styling -->
          <RouterLink :to="`/procedure/${bookmark.id}`" class="card-body-link">
            <div class="card-body">
              <h5 class="card-title mb-3">{{ bookmark.attributes.procedure_number }} {{ bookmark.attributes?.name }}</h5>
              <p class="card-text"><strong>Status:</strong> <span class="status badge rounded-pill bg-dark">{{ bookmark.attributes.status}}</span></p>
              <p class="card-text"><strong>Issued: </strong>  {{ bookmark.attributes.issue_date }} | <strong>Replaces: </strong> {{ bookmark.attributes.replaces_date }}</p>
              <p class="card-text">{{ bookmark.attributes.rationale.substring(0, 100) }}...</p>
            </div>
          </RouterLink>
          <button @click="removeBookmark(bookmark.id)" class="btn btn-secondary mt-2">Remove Bookmark</button>
        </div>
      </div>
    </div>

</div> <!-- .bookmark-content --> 
</template>

<script>
  import api from '@/services/api';
  import { authState } from '@/store/authState';
  import { useTenant } from '@/composables/useTenant';

export default {
  setup() {
    const { contentLabelPlural } = useTenant();
    return { contentLabelPlural };
  },
  data() {
    return {
      bookmarks: [],
      error: null,
    };
  },
  computed: {
    isLoggedIn() {
      return authState.isLoggedIn;
    }
  },
  async beforeMount() {
    await this.fetchBookmarks();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchBookmarks() {
      if (!this.isLoggedIn) {
        this.error = 'You need to be logged in to view your bookmarks.';
        return;
      }
      try {
        this.bookmarks = await api.getUserBookmarkedProcedures(authState.user.id);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        this.error = 'Error fetching bookmarks. Please try again later.';
      }
    },
    async removeBookmark(procedureId) {
      if (!this.isLoggedIn) {
        this.$router.push('/login');
        return;
      }
      try {
        await api.removeBookmark(authState.user.id, procedureId);
        this.bookmarks = this.bookmarks.filter(b => b.id !== procedureId);
      } catch (error) {
        console.error('Error removing bookmark:', error);
        this.error = 'Failed to remove bookmark.';
      }
    }
  }
};
</script>

<style scoped>
.favorites-page {
  padding: 20px;
}
.bookmarked-procedures {
  display: flex;
  flex-wrap: wrap;
}
.bookmark-item {
  border: 1px solid #ddd;
  padding: 10px;
  margin: 10px;
  width: calc(33.333% - 20px); /* 3 items per row */
  box-sizing: border-box;
}
.bookmark-item h3 {
  margin-top: 0;
}
/* Remove link styling for RouterLink */
.card-body-link {
  color: inherit;       /* Inherit the parent text color */
  text-decoration: none; /* Remove underline */
}

.card-body-link:hover {
  color: inherit;       /* Prevent color change on hover */
  text-decoration: none; /* Keep underline removed on hover */
}

/* Ensure card has a minimum width */
.bookmark-item {
  min-width: 300px; /* Adjust this value as necessary */
  margin-bottom: 1rem; /* Adds spacing between cards */
}

/* For mobile view */
@media (max-width: 576px) {
  .bookmark-item {
    min-width: 100%; /* Full width for mobile screens */
    margin-bottom: 1rem;
  }
}

</style>
