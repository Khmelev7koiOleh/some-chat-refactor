import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "../views/Login.vue";

const routes = [
  {
    path: "/",
    component: HomeView,
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

// import { createRouter, createWebHistory } from "vue-router";
// import HomeView from "../views/HomeView.vue";
// import ChatsView from "./ChatsView.vue";
// const routes = [
//   {
//     path: "/",
//     component: HomeView,
//   },
//   {
//     path: "/ChatsVue",
//     component: ChatsVue,
//   },
// ];

// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// });
// export default router;
