import { getAuth } from "firebase/auth";
import { useRouter } from "vue-router";

const authGuard = (to, from, next) => {
  const auth = getAuth(); // Get the Firebase Auth instance
  const user = auth.currentUser; // Get the current logged-in user
  const router = useRouter();

  // If there is no user logged in, redirect to the login page
  if (!user) {
    return router.push("/login"); // Redirect to the login page
  }

  // Otherwise, allow the user to access the route
  next();
};

export default authGuard;
