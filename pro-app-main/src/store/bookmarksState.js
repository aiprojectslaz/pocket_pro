// src/store/bookmarksState.js
import { reactive } from 'vue';

export const bookmarksState = reactive({
  bookmarks: JSON.parse(localStorage.getItem('bookmarks')) || [],

  addBookmark(procedure) {
    if (!this.bookmarks.includes(procedure.id)) {
      this.bookmarks.push(procedure.id);
      localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    }
  },

  removeBookmark(procedure) {
    this.bookmarks = this.bookmarks.filter(id => id !== procedure.id);
    localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
  },

  isBookmarked(procedure) {
    return this.bookmarks.includes(procedure.id);
  },
});
