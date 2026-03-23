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
      <p>No bookmarks yet. Start bookmarking procedures to see them here.</p>
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
  import axios from 'axios';
  import api from '@/services/api';
  import { mapState } from 'vuex';
  import { authState } from '@/store/authState'; // Auth state management
  import { bookmarksState } from '@/store/bookmarksState'; // Bookmark state management

export default {
  data() {
    return {
      bookmarks: [], // Initialize as an empty array
      error: [],
    };
  },
  computed: {
    isLoggedIn() {
      return authState.isLoggedIn;
    }
  },
  beforeMount() {
    this.fetchBookmarks();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchBookmarks() {
      if (this.isLoggedIn) {
        console.log('Fetching bookmarks for user:', this.user);

        try {
          const jwt = localStorage.getItem('jwt');
          const userBookmarkIdURL = 'http://localhost:1337/api/users/me?populate=bookmarks';

          // Fetch user data for bookmark ID
          const userBookmarkIdResponse = await fetch(userBookmarkIdURL, {
            headers: {
              'Authorization': `Bearer ${jwt}`
            }
          });

          if (!userBookmarkIdResponse.ok) {
            throw new Error('Network response was not ok');
          }

          const userBookmarkIdData = await userBookmarkIdResponse.json();
          const userBookmarks = userBookmarkIdData.bookmarks || [];
          const userBookmarkId = userBookmarks.map(bookmark => bookmark.id);

          if (userBookmarkId.length > 0) {
            const bookmarkId = userBookmarkId[0];
            const bookmarkDataURL = `http://localhost:1337/api/bookmarks?filters[id][$eq]=${userBookmarkId}&populate=*`;

            const bookmarkDataResponse = await fetch(bookmarkDataURL, {
              headers: {
                'Authorization': `Bearer ${jwt}`
              }
            });

            if (!bookmarkDataResponse.ok) {
              throw new Error('Network response was not ok');
            }

            const bookmarkData = await bookmarkDataResponse.json();
            this.bookmarks = bookmarkData.data[0].attributes.procedures.data;
          } else {
            this.bookmarks = [];
            console.log('No bookmarks found.');
          }
        } catch (error) {
          console.error('Error fetching bookmarks:', error);
          this.error = 'Error fetching bookmarks. Please try again later.';
        }
      } else {
        this.error = 'You need to be logged in to view your bookmarks.';
      }
    },
    async removeBookmark(bookmarkId) {
      if (!this.isLoggedIn) {
        console.log('User is not logged in');
        this.$router.push('/login');
        return;
      }

      try {
        const jwt = localStorage.getItem('jwt');
        const userBookmarkIdURL = 'http://localhost:1337/api/users/me?populate=bookmarks';
        const userBookmarkIdResponse = await fetch(userBookmarkIdURL, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        if (!userBookmarkIdResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const userBookmarkIdData = await userBookmarkIdResponse.json();
        const userBookmarks = userBookmarkIdData.bookmarks || [];
        const userBookmarkId = userBookmarks.map(bookmark => bookmark.id);

        if (userBookmarkId.length > 0) {
          const userId = userBookmarkId[0];
          const updatedBookmarks = this.bookmarks.filter(bookmark => bookmark.id !== bookmarkId);

          const response = await fetch(`http://localhost:1337/api/bookmarks/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
              data: {
                procedures: updatedBookmarks.map(bookmark => bookmark.id)
              }
            })
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          this.bookmarks = updatedBookmarks;
          console.log('Bookmark removed successfully');
        }
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
