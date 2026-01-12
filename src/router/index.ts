import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue'),
    },
    {
      path: '/sketches',
      name: 'sketches',
      component: () => import('@/views/SketchesPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' }
    },
  ],
});

export default router;
