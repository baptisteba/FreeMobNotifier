<template>
  <div v-if="canInstall" class="install-pwa">
    <button 
      @click="installPWA" 
      class="install-btn"
      :disabled="installing"
      title="Install FreeMobNotifier as an app"
    >
      <svg v-if="!installing" class="install-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <svg v-else class="install-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <span class="install-text">{{ installing ? 'Installing...' : 'Install App' }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'InstallPWA',
  data() {
    return {
      canInstall: false,
      installing: false
    };
  },
  mounted() {
    // Check if PWA can be installed
    this.checkInstallable();
    
    // Listen for PWA install events
    window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
    window.addEventListener('appinstalled', this.onAppInstalled);
  },
  beforeUnmount() {
    window.removeEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
    window.removeEventListener('appinstalled', this.onAppInstalled);
  },
  methods: {
    checkInstallable() {
      // Check if PWA is installable
      if (this.$pwa && this.$pwa.checkInstallable()) {
        this.canInstall = true;
      } else {
        // Also check for iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.navigator.standalone;
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        if (isIOS && !isStandalone && isSafari) {
          this.canInstall = true;
        }
      }
    },
    
    async installPWA() {
      if (this.installing) return;
      
      this.installing = true;
      
      try {
        // Check if it's iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        if (isIOS && isSafari) {
          // Show iOS installation instructions
          this.showIOSInstructions();
          this.installing = false;
          return;
        }
        
        // Try to install using PWA install prompt
        if (this.$pwa && this.$pwa.checkInstallable()) {
          const result = await this.$pwa.showInstallPrompt();
          if (result) {
            console.log('PWA installed successfully');
          }
        } else {
          // Fallback: show manual installation instructions
          this.showManualInstructions();
        }
      } catch (error) {
        console.error('PWA installation failed:', error);
        this.showManualInstructions();
      } finally {
        this.installing = false;
      }
    },
    
    showIOSInstructions() {
      const message = `To install FreeMobNotifier on your iPhone/iPad:\n\n1. Tap the Share button (square with arrow up)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm\n\nThe app will appear on your home screen!`;
      alert(message);
    },
    
    showManualInstructions() {
      const userAgent = navigator.userAgent;
      let message = 'To install FreeMobNotifier:\n\n';
      
      if (userAgent.includes('Chrome')) {
        message += '1. Click the 3-dot menu in Chrome\n2. Select "Install FreeMobNotifier"\n3. Click "Install" to confirm';
      } else if (userAgent.includes('Firefox')) {
        message += '1. Look for the install icon in the address bar\n2. Click it to install the app\n\nNote: Firefox has limited PWA support.';
      } else if (userAgent.includes('Safari')) {
        message += '1. Click Share button in Safari\n2. Select "Add to Dock" or "Add to Home Screen"\n3. Click "Add" to confirm';
      } else {
        message += '1. Look for an install option in your browser menu\n2. Or bookmark this page for easy access';
      }
      
      alert(message);
    },
    
    onBeforeInstallPrompt() {
      this.canInstall = true;
    },
    
    onAppInstalled() {
      this.canInstall = false;
      console.log('PWA installed successfully');
    }
  }
};
</script>

<style scoped>
.install-pwa {
  display: flex;
  align-items: center;
}

.install-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--free-primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  text-decoration: none;
}

.install-btn:hover:not(:disabled) {
  background-color: #c5000d;
  transform: translateY(-1px);
}

.install-btn:active:not(:disabled) {
  transform: translateY(0);
}

.install-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.install-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-shrink: 0;
}

.install-text {
  white-space: nowrap;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Hide text on very small screens */
@media (max-width: 480px) {
  .install-text {
    display: none;
  }
  
  .install-btn {
    padding: 0.5rem;
    min-width: 2.5rem;
    justify-content: center;
  }
}
</style> 