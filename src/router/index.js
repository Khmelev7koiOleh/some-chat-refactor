import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "../views/Login.vue";

const routes = [
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/",
    component: HomeView,
    meta: { requiresAuth: true }, // Requires authentication
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
