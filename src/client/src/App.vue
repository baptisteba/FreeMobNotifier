<template>
  <div class="app">
    <Navbar />

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="container">
        <p class="text-center">FreeMobNotifier &copy; {{ new Date().getFullYear() }}</p>
      </div>
    </footer>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>
/* Variables CSS pour le thème clair */
:root {
  --free-primary-color: #E1000F;
  --free-secondary-color: #333333;
  --free-background-color: #f8f8f8;
  --free-border-color: #cccccc;
  --free-success-color: #4CAF50;
  --free-warning-color: #FF9800;
  --free-error-color: #F44336;
  --free-text-color: #333333;
  --free-text-color-secondary: #666666;
  --free-card-background: #ffffff;
  --free-navbar-background: #ffffff;
  --free-footer-background: #f5f5f5;
  --free-shadow: rgba(0, 0, 0, 0.1);
}

/* Variables CSS pour le thème sombre */
:root.dark-theme {
  --free-primary-color: #FF1A2D;
  --free-secondary-color: #e0e0e0;
  --free-background-color: #1a1a1a;
  --free-border-color: #404040;
  --free-success-color: #5CBF60;
  --free-warning-color: #FFA726;
  --free-error-color: #F66859;
  --free-text-color: #e0e0e0;
  --free-text-color-secondary: #b0b0b0;
  --free-card-background: #2a2a2a;
  --free-navbar-background: #2a2a2a;
  --free-footer-background: #1f1f1f;
  --free-shadow: rgba(0, 0, 0, 0.3);
}

/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--free-text-color);
  background-color: var(--free-background-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-bottom: 80px; /* Space for bottom navigation on mobile */
  background-color: var(--free-background-color);
  color: var(--free-text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: calc(100vh - 140px); /* Ensure content fills available space */
}

/* Desktop adjustments */
@media (min-width: 768px) {
  .main-content {
    padding-bottom: 0;
    padding-top: 80px; /* Space for top navigation on desktop */
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  color: var(--free-text-color);
  transition: color 0.3s ease;
}

.footer {
  background-color: var(--free-footer-background);
  padding: 1rem 0;
  border-top: 1px solid var(--free-border-color);
  text-align: center;
  font-size: 14px;
  color: var(--free-text-color-secondary);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Utility classes */
.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.text-center {
  text-align: center;
}

/* Theme utility classes */
.theme-bg {
  background-color: var(--free-background-color);
  color: var(--free-text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.theme-card-bg {
  background-color: var(--free-card-background);
  color: var(--free-text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.theme-text {
  color: var(--free-text-color);
  transition: color 0.3s ease;
}

.theme-text-secondary {
  color: var(--free-text-color-secondary);
  transition: color 0.3s ease;
}

/* Button styles */
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background-color: var(--free-primary-color);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #c5000d;
}

.btn-secondary {
  background-color: var(--free-card-background);
  color: var(--free-text-color);
  border: 1px solid var(--free-border-color);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: var(--free-border-color);
}

/* Form styles */
.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--free-border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--free-card-background);
  color: var(--free-text-color);
  transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--free-primary-color);
  box-shadow: 0 0 0 3px rgba(225, 0, 15, 0.1);
}

/* Card styles */
.card {
  background: var(--free-card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--free-shadow);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* Responsive styles */
@media (max-width: 768px) {
  .form-group {
    margin-bottom: 1rem;
  }
  
  .btn {
    width: 100%;
    text-align: center;
  }
}
</style> 