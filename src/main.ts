import { createApp } from 'vue';
import App from '@/App.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import '@/icons/fontawesome';
import router from './router';
import '@/style.css';

const app = createApp(App)
  .component('font-awesome-icon', FontAwesomeIcon)
  .use(router)
  .mount('#app');
