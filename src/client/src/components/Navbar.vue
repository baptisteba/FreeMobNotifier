<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="navbar-logo desktop-only">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span class="logo-text">FreeMobNotifier</span>
      </router-link>
      
      <div class="navbar-actions">
        <!-- PWA Install Button - Desktop Only -->
        <InstallPWA class="desktop-only install-pwa-button" />
        
        <router-link to="/" class="nav-item" title="Accueil" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="nav-text">Accueil</span>
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
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
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
  color: #666;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
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
    border-radius: 50%;
    width: 40px;
    height: 40px;
    justify-content: center;
  }
  
  .nav-text {
    display: none;
  }
  
  .nav-icon {
    width: 20px;
    height: 20px;
  }
  
  .logo-text {
    display: inline;
    margin-left: 8px;
  }
  
  .install-pwa-button {
    margin-right: 10px;
  }
}
</style> 