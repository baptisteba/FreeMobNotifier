import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Home from './views/Home.vue';
import Settings from './views/Settings.vue';
import MessageHistory from './views/MessageHistory.vue';
import ScheduledMessages from './views/ScheduledMessages.vue';

// Import CSS
import './assets/main.css';

// Create router
const routes = [
  { path: '/', component: Home },
  { path: '/settings', component: Settings },
  { path: '/history', component: MessageHistory },
  { path: '/scheduled', component: ScheduledMessages }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Create app
const app = createApp(App);
app.use(router);
app.mount('#app'); 