// utils/auth.js
export function getAuthState() {
    const jwt = localStorage.getItem('jwt');
    
    // Check if JWT exists and determine admin status (you need to define this logic)
    const isLoggedIn = !!jwt;
    const isAdmin = jwt ? checkIfAdmin(jwt) : false;
  
    return {
      isLoggedIn,
      isAdmin
    };
  }
  
  // Example function to check if the user is an admin
  function checkIfAdmin(jwt) {
    // Decode JWT or make an API call to verify user role
    // This is a placeholder and you should replace it with actual logic
    // For instance, decode the JWT and check the role
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1])); // Decode JWT payload
      return payload.role === 'admin'; // Check role or other property
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return false;
    }
  }
  