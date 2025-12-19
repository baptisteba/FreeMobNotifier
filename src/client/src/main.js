import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Home from './views/Home.vue';
import Settings from './views/Settings.vue';
import MessageHistory from './views/MessageHistory.vue';
import ScheduledMessages from './views/ScheduledMessages.vue';
import { useTheme } from './composables/useTheme.js';

// Import CSS
import './assets/main.css';

// Initialize theme
const { initializeTheme } = useTheme();
initializeTheme();

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

// PWA Install prompt handling
let deferredPrompt;

// Add PWA install functionality to global scope
app.config.globalProperties.$pwa = {
  deferredPrompt: null,
  canInstall: false,
  
  // Check if app can be installed
  checkInstallable() {
    return this.canInstall && this.deferredPrompt;
  },
  
  // Show install prompt
  async showInstallPrompt() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`PWA install prompt outcome: ${outcome}`);
      this.deferredPrompt = null;
      this.canInstall = false;
      return outcome === 'accepted';
    }
    return false;
  }
};

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: beforeinstallprompt event triggered');
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  app.config.globalProperties.$pwa.deferredPrompt = e;
  app.config.globalProperties.$pwa.canInstall = true;
  
  // Optionally, send analytics event that PWA install promo was shown
  console.log('PWA: Install prompt available');
});

// Listen for appinstalled event
window.addEventListener('appinstalled', (e) => {
  console.log('PWA: App installed successfully');
  deferredPrompt = null;
  app.config.globalProperties.$pwa.deferredPrompt = null;
  app.config.globalProperties.$pwa.canInstall = false;
});

// Register service worker with auto-update
if ('serviceWorker' in navigator) {
  // Track if we're refreshing to avoid infinite loops
  let refreshing = false;

  // Auto-reload when new service worker takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      console.log('PWA: New version available, reloading...');
      refreshing = true;
      window.location.reload();
    }
  });

  // Listen for update messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Message from service worker:', event.data);

    if (event.data && event.data.type === 'SW_UPDATED') {
      console.log(`PWA: Updated to version ${event.data.version}`);
    }
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none' // Always check for SW updates
      });
      console.log('Service Worker registered successfully:', registration.scope);

      // Check for updates immediately
      registration.update();

      // Check for updates periodically (every 60 seconds when app is active)
      setInterval(() => {
        registration.update();
        console.log('PWA: Checking for updates...');
      }, 60000);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('PWA: Update found, installing new version...');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New service worker ready - will auto-reload via controllerchange
              console.log('PWA: New version ready');
            } else {
              // First time service worker installed
              console.log('PWA: App ready for offline use');
            }
          }
        });
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });

  // Check for updates when app becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
        console.log('PWA: Checking for updates (app visible)');
      });
    }
  });
}

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('PWA: Back online');
  // Trigger background sync if available
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register('background-sync');
    });
  }
});

window.addEventListener('offline', () => {
  console.log('PWA: Gone offline');
});

app.mount('#app'); 