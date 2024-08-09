import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const Home = () => import("../views/home.vue");

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    meta: {
      title: "首页",
    },
    component: Home,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;