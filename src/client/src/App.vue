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
:root {
  --free-primary-color: #E1000F;
  --free-secondary-color: #333333;
  --free-background-color: #f8f8f8;
  --free-border-color: #cccccc;
  --free-success-color: #4CAF50;
  --free-warning-color: #FF9800;
  --free-error-color: #F44336;
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
  color: var(--free-secondary-color);
  background-color: var(--free-background-color);
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.footer {
  background-color: #f5f5f5;
  padding: 1rem 0;
  border-top: 1px solid var(--free-border-color);
  text-align: center;
  font-size: 14px;
  color: #666;
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

/* Button styles */
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s, transform 0.1s;
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
  background-color: #f2f2f2;
  color: var(--free-secondary-color);
  border: 1px solid var(--free-border-color);
}

.btn-secondary:hover {
  background-color: #e8e8e8;
}

/* Form styles */
.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--free-border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--free-primary-color);
  box-shadow: 0 0 0 3px rgba(225, 0, 15, 0.1);
}

/* Card styles */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
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