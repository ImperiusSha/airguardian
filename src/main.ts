import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import store from './store'; 
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';


Chart.register(ChartDataLabels, LineController, CategoryScale, LinearScale, PointElement, LineElement, TimeScale);

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';


const app = createApp(App);
app.use(IonicVue);
app.use(router);
app.use(store);
app.config.globalProperties.$shepherd = Shepherd;
  
router.isReady().then(() => {
  app.mount('#app');
});
