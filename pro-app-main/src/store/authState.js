// src/store/authState.js
import { reactive } from 'vue'
import { supabase } from '@/lib/supabase'

export const authState = reactive({
  session: null,

  get jwt() {
    return this.session?.access_token || null
  },

  get user() {
    return this.session?.user || null
  },

  get isLoggedIn() {
    return !!this.session
  },

  // Call once in main.js to sync session on page load and listen for changes.
  init() {
    supabase.auth.getSession().then(({ data }) => {
      this.session = data.session
      if (data.session?.user?.email) {
        localStorage.setItem('username', data.session.user.email)
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      this.session = session
      if (session?.user?.email) {
        localStorage.setItem('username', session.user.email)
      } else {
        localStorage.removeItem('username')
        localStorage.removeItem('jwt')
      }
    })
  },

  async logout() {
    await supabase.auth.signOut()
    this.session = null
  },
})
