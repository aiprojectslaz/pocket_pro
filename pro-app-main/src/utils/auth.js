// utils/auth.js
import { authState } from '@/store/authState'

export function getAuthState() {
  return {
    isLoggedIn: authState.isLoggedIn,
    isAdmin: authState.isAdmin,
  }
}
