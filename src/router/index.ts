import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue';
import Sketches from '@/views/Sketches.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/sketches',
      name: 'sketches',
      component: Sketches,
    },
  ],
});

export default router
