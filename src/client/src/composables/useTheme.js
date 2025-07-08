import { ref, computed, watch } from 'vue';

// État global du thème
const isDarkMode = ref(false);

// Clé pour localStorage
const THEME_STORAGE_KEY = 'freemobnotifier-theme';

export const useTheme = () => {
  // Initialiser le thème depuis localStorage ou détection système
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark';
    } else {
      // Détecter la préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDarkMode.value = prefersDark;
    }
    
    applyTheme();
  };

  // Appliquer le thème au document
  const applyTheme = () => {
    const root = document.documentElement;
    
    if (isDarkMode.value) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  };

  // Basculer le thème
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    applyTheme();
    
    // Sauvegarder dans localStorage
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode.value ? 'dark' : 'light');
  };

  // Définir le thème manuellement
  const setTheme = (theme) => {
    isDarkMode.value = theme === 'dark';
    applyTheme();
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  };

  // Computed pour le nom du thème actuel
  const currentTheme = computed(() => isDarkMode.value ? 'dark' : 'light');

  // Écouter les changements de préférence système
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      isDarkMode.value = e.matches;
      applyTheme();
    }
  });

  // Initialiser le thème au premier chargement
  if (typeof window !== 'undefined') {
    initializeTheme();
  }

  return {
    isDarkMode,
    currentTheme,
    toggleTheme,
    setTheme,
    initializeTheme
  };
}; 