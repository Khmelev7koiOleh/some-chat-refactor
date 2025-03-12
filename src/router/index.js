import { createRouter, createWebHistory } from "vue-router";
import authGuard from "../composables/authGuard";
import HomeView from "../views/HomeView.vue";
import Login from "../views/Login.vue";

const routes = [
  {
    path: "/",
    component: HomeView,
    meta: { requiresAuth: true },
    // beforeEnter: authGuard,
  },
  {
    path: "/login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
