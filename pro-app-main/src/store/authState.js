// src/store/authState.js
import { reactive } from 'vue'
import { supabase } from '@/lib/supabase'
import { applyTenantForUser } from '@/utils/tenant'

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

  get isAdmin() {
    return this.session?.user?.app_metadata?.role === 'admin'
  },

  // Call once in main.js to sync session on page load and listen for changes.
  init() {
    supabase.auth.getSession().then(({ data }) => {
      this.session = data.session
      if (data.session?.user?.email) {
        localStorage.setItem('username', data.session.user.email)
        localStorage.setItem('jwt', data.session.access_token)
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      this.session = session
      if (session?.user?.email) {
        localStorage.setItem('username', session.user.email)
        localStorage.setItem('jwt', session.access_token)
        // Re-apply tenant CSS variables on page refresh / tab restore
        applyTenantForUser(session.user.id)
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
