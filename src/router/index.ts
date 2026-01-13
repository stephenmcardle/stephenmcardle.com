import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue'),
      meta: {
        title: 'Home',
      },
    },
    {
      path: '/sketches',
      name: 'sketches',
      component: () => import('@/views/SketchesPage.vue'),
      meta: {
        title: 'Sketches',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home', params: {} }
    },
  ],
});

const DEFAULT_TITLE = 'Stephen McArdle'
router.afterEach((to) => {
  document.title =
    to.meta.title
    ? `${to.meta.title} | ${DEFAULT_TITLE}`
    : DEFAULT_TITLE;
});

export default router;
