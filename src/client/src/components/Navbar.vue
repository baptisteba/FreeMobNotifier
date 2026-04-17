<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/today" class="navbar-logo desktop-only">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span class="logo-text">FreeMobNotifier</span>
      </router-link>
      
      <div class="navbar-actions">
        <!-- PWA Install Button - Desktop Only -->
        <InstallPWA class="desktop-only install-pwa-button" />
        
        <router-link to="/today" class="nav-item" title="Aujourd'hui" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <line x1="12" y1="14" x2="12" y2="18"></line>
          </svg>
          <span class="nav-text">Aujourd'hui</span>
        </router-link>

        <router-link to="/compose" class="nav-item" title="Composer" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span class="nav-text">Composer</span>
        </router-link>

        <router-link to="/history" class="nav-item" title="Historique" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span class="nav-text">Historique</span>
        </router-link>
        
        <router-link to="/scheduled" class="nav-item" title="Messages programmés" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span class="nav-text">Programmés</span>
        </router-link>
        
        <router-link to="/settings" class="nav-item" title="Paramètres" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <span class="nav-text">Paramètres</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import InstallPWA from './InstallPWA.vue';

export default {
  name: 'Navbar',
  components: {
    InstallPWA
  }
};
</script>

<style scoped>
.navbar {
  background-color: var(--free-navbar-background);
  box-shadow: 0 2px 10px var(--free-shadow);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--free-primary-color, #E1000F);
  font-weight: bold;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.logo-icon {
  color: var(--free-primary-color, #E1000F);
  flex-shrink: 0;
}

.logo-text {
  margin-left: 8px;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
  min-width: 0;
}



.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 8px;
  color: var(--free-text-color-secondary);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  min-width: 0;
}

.nav-item:hover {
  background-color: rgba(225, 0, 15, 0.05);
  color: var(--free-primary-color, #E1000F);
}

.nav-item.active {
  color: var(--free-primary-color, #E1000F);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-text {
  font-size: 0.65rem;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hide desktop elements on mobile */
@media (max-width: 767px) {
  .desktop-only {
    display: none;
  }
  
  .navbar-actions {
    flex: 1;
    justify-content: space-around;
    width: 100%;
  }
  
  .theme-toggle {
    padding: 6px;
    order: -1; /* Place theme toggle at the beginning on mobile */
  }
}

/* Very small mobile devices */
@media (max-width: 360px) {
  .navbar-container {
    padding: 0 8px;
    justify-content: center;
  }
  
  .navbar-actions {
    gap: 4px;
    justify-content: space-around;
    flex: 1;
    width: 100%;
  }
  
  .nav-item {
    padding: 4px 6px;
    flex: 1;
    max-width: none;
  }
  
  .nav-icon {
    width: 18px;
    height: 18px;
  }
  
  .nav-text {
    font-size: 0.6rem;
    margin-top: 1px;
  }
  
  .theme-toggle {
    padding: 4px;
    flex-shrink: 0;
  }
  
  .theme-toggle svg {
    width: 18px;
    height: 18px;
  }
}

/* Small mobile devices */
@media (max-width: 480px) and (min-width: 361px) {
  .navbar-container {
    padding: 0 10px;
    justify-content: center;
  }
  
  .navbar-actions {
    gap: 6px;
    flex: 1;
    justify-content: space-around;
    width: 100%;
  }
  
  .nav-item {
    padding: 5px 7px;
  }
  
  .nav-text {
    font-size: 0.62rem;
  }
  
  .theme-toggle {
    padding: 5px;
  }
}

/* Medium mobile devices */
@media (max-width: 767px) and (min-width: 481px) {
  .navbar-container {
    justify-content: center;
  }
  
  .navbar-actions {
    gap: 10px;
    flex: 1;
    justify-content: space-around;
    width: 100%;
  }
  
  .nav-item {
    padding: 8px 10px;
  }
  
  .theme-toggle {
    padding: 8px;
  }
}

/* Desktop styles */
@media (min-width: 768px) {
  .navbar {
    top: 0;
    bottom: auto;
    height: 64px;
  }
  
  .navbar-container {
    height: 100%;
    padding: 0 20px;
  }
  
  .navbar-actions {
    gap: 15px;
    justify-content: flex-end;
  }
  
  .nav-item {
    padding: 8px;
  }
  
  .theme-toggle {
    padding: 8px;
    margin-right: 8px;
  }
}
</style> 