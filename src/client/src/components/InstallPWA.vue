<template>
  <div v-if="canInstall" class="install-pwa">
    <button
      @click="installPWA"
      class="install-btn"
      :disabled="installing"
      title="Installer FreeMobNotifier comme application"
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
      <span class="install-text">{{ installing ? 'Installation en cours...' : 'Installer' }}</span>
    </button>

    <div v-if="instructionsOpen" class="pwa-modal-overlay" @click.self="closeInstructions">
      <div class="pwa-modal">
        <div class="pwa-modal-header">
          <h3>{{ instructionsTitle }}</h3>
          <button class="pwa-modal-close" @click="closeInstructions" aria-label="Fermer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <ol class="pwa-steps">
          <li v-for="(step, i) in instructionsSteps" :key="i" class="pwa-step">
            <span class="step-num">{{ i + 1 }}</span>
            <span class="step-body">
              <span v-html="step.html"></span>
            </span>
          </li>
        </ol>
        <div class="pwa-modal-footer">
          <button class="btn btn-primary" @click="closeInstructions">J'ai compris</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const DISMISS_KEY = 'freemob-ios-install-dismissed';

export default {
  name: 'InstallPWA',
  data() {
    return {
      canInstall: false,
      installing: false,
      instructionsOpen: false,
      instructionsKind: 'ios' // 'ios' | 'manual-chrome' | 'manual-firefox' | 'manual-safari' | 'manual-other'
    };
  },
  computed: {
    instructionsTitle() {
      return this.instructionsKind === 'ios' ? 'Installer sur iOS' : 'Installer l\'application';
    },
    instructionsSteps() {
      switch (this.instructionsKind) {
        case 'ios':
          return [
            { html: 'Appuyez sur le bouton <strong>Partager</strong> <svg style="display:inline;vertical-align:middle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> en bas de Safari.' },
            { html: 'Faites défiler et choisissez <strong>« Sur l\'écran d\'accueil »</strong>.' },
            { html: 'Appuyez sur <strong>Ajouter</strong>. L\'application apparaît sur votre écran d\'accueil.' }
          ];
        case 'manual-chrome':
          return [
            { html: 'Ouvrez le menu ⋮ dans Chrome.' },
            { html: 'Choisissez <strong>« Installer l\'application »</strong>.' },
            { html: 'Confirmez avec <strong>Installer</strong>.' }
          ];
        case 'manual-firefox':
          return [
            { html: 'Cherchez l\'icône d\'installation dans la barre d\'adresse.' },
            { html: 'Cliquez dessus pour installer l\'application.' },
            { html: 'Note : Firefox a un support PWA limité.' }
          ];
        case 'manual-safari':
          return [
            { html: 'Cliquez sur <strong>Partager</strong> dans Safari.' },
            { html: 'Choisissez <strong>« Ajouter au Dock »</strong>.' },
            { html: 'Confirmez avec <strong>Ajouter</strong>.' }
          ];
        default:
          return [
            { html: 'Cherchez une option d\'installation dans le menu de votre navigateur.' },
            { html: 'Ou ajoutez cette page à vos favoris pour un accès rapide.' }
          ];
      }
    }
  },
  mounted() {
    this.checkInstallable();
    window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
    window.addEventListener('appinstalled', this.onAppInstalled);
  },
  beforeUnmount() {
    window.removeEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
    window.removeEventListener('appinstalled', this.onAppInstalled);
  },
  methods: {
    checkInstallable() {
      if (this.$pwa && this.$pwa.checkInstallable()) {
        this.canInstall = true;
      } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.navigator.standalone;
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        if (isIOS && !isStandalone && isSafari) {
          try {
            if (localStorage.getItem(DISMISS_KEY) === '1') return;
          } catch {}
          this.canInstall = true;
        }
      }
    },

    async installPWA() {
      if (this.installing) return;
      this.installing = true;
      try {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

        if (isIOS && isSafari) {
          this.openInstructions('ios');
          return;
        }

        if (this.$pwa && this.$pwa.checkInstallable()) {
          const result = await this.$pwa.showInstallPrompt();
          if (result) console.log('PWA installed successfully');
        } else {
          this.openInstructions(this.detectBrowserKind());
        }
      } catch (error) {
        console.error('PWA installation failed:', error);
        this.openInstructions(this.detectBrowserKind());
      } finally {
        this.installing = false;
      }
    },

    detectBrowserKind() {
      const ua = navigator.userAgent;
      if (ua.includes('Chrome')) return 'manual-chrome';
      if (ua.includes('Firefox')) return 'manual-firefox';
      if (ua.includes('Safari')) return 'manual-safari';
      return 'manual-other';
    },

    openInstructions(kind) {
      this.instructionsKind = kind;
      this.instructionsOpen = true;
      document.body.classList.add('modal-open');
    },

    closeInstructions() {
      this.instructionsOpen = false;
      document.body.classList.remove('modal-open');
      if (this.instructionsKind === 'ios') {
        try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
      }
    },

    onBeforeInstallPrompt() {
      this.canInstall = true;
    },

    onAppInstalled() {
      this.canInstall = false;
      this.closeInstructions();
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

.pwa-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 16px;
}

.pwa-modal {
  background: var(--free-card-background);
  color: var(--free-text-color);
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 8px 32px var(--free-shadow);
  overflow: hidden;
}

@media (max-width: 480px) {
  .pwa-modal {
    box-shadow: 0 4px 12px var(--free-shadow);
  }
}

.pwa-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--free-border-color);
}

.pwa-modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.pwa-modal-close {
  background: transparent;
  border: none;
  color: var(--free-text-color-secondary);
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pwa-steps {
  list-style: none;
  padding: 20px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pwa-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--free-primary-color);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.step-body {
  flex: 1;
  line-height: 1.5;
}

.pwa-modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--free-border-color);
  display: flex;
  justify-content: flex-end;
}
</style>
