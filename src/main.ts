import { createApp } from 'vue';
import App from '@/App.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import '@/icons/fontawesome';
import router from './router';
import '@/style.css';

import '@fontsource/noto-sans/400.css';
import '@fontsource/noto-sans/500.css';
import '@fontsource/noto-sans/700.css';

createApp(App)
  .component('font-awesome-icon', FontAwesomeIcon)
  .use(router)
  .mount('#app');
