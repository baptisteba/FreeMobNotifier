<template>
  <div class="settings-container">
    <h1 class="page-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="page-icon">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
      Paramètres
    </h1>

    <div class="card">
      <div v-if="isLoading" class="loading">
        <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        <p>Chargement des paramètres...</p>
      </div>

      <div v-else>
        <h2 class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          Free Mobile API
        </h2>
        
        <p class="api-info">
          Ces informations sont nécessaires pour envoyer des SMS via l'API Free Mobile.
          Vous pouvez les trouver dans votre espace abonné Free Mobile sous "Mes Options" &gt; "Notification par SMS".
        </p>
        
        <form @submit.prevent="saveSettings">
          <div class="form-group">
            <label for="userId">Identifiant d'utilisateur</label>
            <input 
              type="text" 
              id="userId" 
              v-model="settings.userId"
              class="form-control"
              :class="{'is-invalid': errors.userId}"
              placeholder="Votre identifiant Free Mobile"
            />
            <div v-if="errors.userId" class="error-message">{{ errors.userId }}</div>
          </div>
          
          <div class="form-group">
            <label for="apiKey">Clé d'API</label>
            <div class="api-key-input">
              <input 
                :type="showApiKey ? 'text' : 'password'" 
                id="apiKey" 
                v-model="settings.apiKey"
                class="form-control"
                :class="{'is-invalid': errors.apiKey}"
                placeholder="Votre clé d'API Free Mobile"
              />
              <button 
                type="button" 
                class="toggle-visibility-btn"
                @click="showApiKey = !showApiKey"
                :title="showApiKey ? 'Masquer' : 'Afficher'"
              >
                <svg v-if="showApiKey" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <div v-if="errors.apiKey" class="error-message">{{ errors.apiKey }}</div>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary"
              :disabled="isSaving"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            
            <button 
              type="button" 
              class="btn-secondary"
              @click="testSettings"
              :disabled="isTesting || !isConfigured"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              {{ isTesting ? 'Envoi du test...' : 'Envoyer un SMS de test' }}
            </button>
          </div>
        </form>
        
        <div v-if="lastUpdated" class="last-updated">
          Dernière mise à jour: {{ formatDate(lastUpdated) }}
        </div>
      </div>
    </div>

    <!-- Interface Preferences Section -->
    <div class="card">
      <h2 class="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        Préférences d'interface
      </h2>
      
      <p class="api-info">
        Personnalisez l'apparence de l'application selon vos préférences.
      </p>
      
      <div class="form-group">
        <label>Thème de l'application</label>
        <div class="theme-selector">
          <button 
            @click="setTheme('light')" 
            :class="['theme-option', !isDarkMode ? 'active' : '']"
            title="Mode clair"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon">
              <circle cx="12" cy="12" r="5"></circle>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>
            <span>Mode clair</span>
          </button>
          
          <button 
            @click="setTheme('dark')" 
            :class="['theme-option', isDarkMode ? 'active' : '']"
            title="Mode sombre"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <span>Mode sombre</span>
          </button>
        </div>
        <div class="theme-description">
          <p>Le thème choisi sera automatiquement sauvegardé et appliqué lors de vos prochaines visites.</p>
        </div>
      </div>
    </div>

    <!-- Data Management Section -->
    <div class="card">
      <h2 class="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
        Gestion des données
      </h2>
      
      <p class="api-info">
        Gérez l'historique de vos messages et les données de l'application.
      </p>
      
      <div class="form-actions">
        <button 
          type="button" 
          class="btn-danger"
          @click="showClearHistoryModal = true"
          :disabled="isClearingHistory"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
          {{ isClearingHistory ? 'Suppression...' : 'Vider l\'historique des messages' }}
        </button>
      </div>
    </div>

    <!-- Clear History Confirmation Modal -->
    <div v-if="showClearHistoryModal" class="modal-overlay" @click="showClearHistoryModal = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button 
            type="button" 
            class="close-btn"
            @click="showClearHistoryModal = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="warning-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          
          <p class="modal-message">
            Que souhaitez-vous supprimer ?
          </p>
          
          <div class="clear-options">
            <div class="option">
              <input 
                type="radio" 
                id="clear-sent" 
                name="clearType" 
                value="sent" 
                v-model="clearType"
                class="option-radio"
              />
              <label for="clear-sent" class="option-label">
                <div class="option-info">
                  <div class="option-title">Historique des messages envoyés</div>
                  <div class="option-description">Supprimer uniquement les messages déjà envoyés (réussis et échoués)</div>
                </div>
              </label>
            </div>
            
            <div class="option">
              <input 
                type="radio" 
                id="clear-scheduled" 
                name="clearType" 
                value="scheduled" 
                v-model="clearType"
                class="option-radio"
              />
              <label for="clear-scheduled" class="option-label">
                <div class="option-info">
                  <div class="option-title">Messages programmés</div>
                  <div class="option-description">Supprimer uniquement les messages en attente d'envoi</div>
                </div>
              </label>
            </div>
            
            <div class="option">
              <input 
                type="radio" 
                id="clear-all" 
                name="clearType" 
                value="all" 
                v-model="clearType"
                class="option-radio"
              />
              <label for="clear-all" class="option-label">
                <div class="option-info">
                  <div class="option-title">Tout supprimer</div>
                  <div class="option-description">Supprimer tous les messages (envoyés et programmés)</div>
                </div>
              </label>
            </div>
          </div>
          
          <p class="modal-warning">
            Cette action est <strong>irréversible</strong> et supprimera définitivement les messages sélectionnés.
          </p>
        </div>
        
        <div class="modal-actions">
          <button 
            type="button" 
            class="btn-secondary"
            @click="showClearHistoryModal = false"
          >
            Annuler
          </button>
          <button 
            type="button" 
            class="btn-danger"
            @click="clearHistory"
            :disabled="isClearingHistory"
          >
            {{ isClearingHistory ? 'Suppression...' : 'Oui, vider l\'historique' }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <div v-if="errorMessage" class="error-message global">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import { useTheme } from '../composables/useTheme.js';

export default {
  setup() {
    const { isDarkMode, setTheme } = useTheme();
    
    const settings = reactive({
      userId: '',
      apiKey: ''
    });
    
    const errors = reactive({
      userId: '',
      apiKey: ''
    });
    
    const isLoading = ref(true);
    const isSaving = ref(false);
    const isTesting = ref(false);
    const showApiKey = ref(false);
    const isApiKeyPlaceholder = ref(false);
    const lastUpdated = ref(null);
    const successMessage = ref('');
    const errorMessage = ref('');
    const showClearHistoryModal = ref(false);
    const isClearingHistory = ref(false);
    const clearType = ref('all');
    
    // Check if API is configured
    const isConfigured = computed(() => {
      return settings.userId && settings.apiKey;
    });
    
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    // Load settings
          const loadSettings = async () => {
      try {
        isLoading.value = true;
        const response = await axios.get('/api/settings');
        
        settings.userId = response.data.userId || '';
        // API key is not returned for security reasons
        // If API key exists, set a placeholder value
        if (response.data.hasApiKey) {
          settings.apiKey = '••••••••••••••••••••••';
          isApiKeyPlaceholder.value = true;
        } else {
          settings.apiKey = '';
          isApiKeyPlaceholder.value = false;
        }
        lastUpdated.value = response.data.updatedAt;
      } catch (error) {
        console.error('Error loading settings:', error);
        errorMessage.value = 'Impossible de charger les paramètres';
      } finally {
        isLoading.value = false;
      }
    };
    
    // Save settings
    const saveSettings = async () => {
      // Reset messages and errors
      successMessage.value = '';
      errorMessage.value = '';
      errors.userId = '';
      errors.apiKey = '';
      
      // Validate
      let isValid = true;
      
      if (!settings.userId) {
        errors.userId = 'L\'identifiant est requis';
        isValid = false;
      }
      
      if (!settings.apiKey) {
        errors.apiKey = 'La clé d\'API est requise';
        isValid = false;
      }
      
      if (!isValid) return;
      
      // Save
      try {
        isSaving.value = true;
        
        // Only send API key if it's not a placeholder (i.e., user has entered a new one)
        const dataToSend = {
          userId: settings.userId
        };
        
        // If the API key is not a placeholder or empty, include it in the request
        if (!isApiKeyPlaceholder.value) {
          dataToSend.apiKey = settings.apiKey;
        }
        
        const response = await axios.put('/api/settings', dataToSend);
        
        // Update UI with placeholder for API key if it was saved
        if (response.data.hasApiKey) {
          settings.apiKey = '••••••••••••••••••••••';
          isApiKeyPlaceholder.value = true;
        }
        
        lastUpdated.value = response.data.updatedAt;
        successMessage.value = 'Paramètres enregistrés avec succès !';
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      } catch (error) {
        console.error('Error saving settings:', error);
        errorMessage.value = error.response?.data?.error || 'Impossible d\'enregistrer les paramètres';
      } finally {
        isSaving.value = false;
      }
    };
    
    // Test settings
    const testSettings = async () => {
      // Reset messages
      successMessage.value = '';
      errorMessage.value = '';
      
      try {
        isTesting.value = true;
        
        const response = await axios.post('/api/settings/test');
        
        // Use the message from the backend response
        successMessage.value = response.data.message || 'Test réussi ! Un SMS de notification a été envoyé à votre téléphone.';
        
        // Clear success message after 8 seconds (longer for notification)
        setTimeout(() => {
          successMessage.value = '';
        }, 8000);
      } catch (error) {
        console.error('Error testing settings:', error);
        
        // Use error messages from backend
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Le test a échoué. Vérifiez vos identifiants.';
        
        errorMessage.value = errorMsg;
      } finally {
        isTesting.value = false;
      }
    };
    
    // Handle theme change
    const handleThemeChange = (theme) => {
      setTheme(theme);
    };
    
    // Clear message history
    const clearHistory = async () => {
      try {
        isClearingHistory.value = true;
        
        const response = await axios.delete('/api/messages', {
          params: { type: clearType.value }
        });
        
        showClearHistoryModal.value = false;
        successMessage.value = `${response.data.message} ! ${response.data.deletedCount} message(s) supprimé(s).`;
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          successMessage.value = '';
        }, 5000);
      } catch (error) {
        console.error('Error clearing history:', error);
        
        showClearHistoryModal.value = false;
        errorMessage.value = error.response?.data?.error || 'Impossible de vider l\'historique';
      } finally {
        isClearingHistory.value = false;
      }
    };
    
    // Load settings on mount
    onMounted(loadSettings);
    
    return {
      isDarkMode,
      setTheme: handleThemeChange,
      settings,
      errors,
      isLoading,
      isSaving,
      isTesting,
      showApiKey,
      isApiKeyPlaceholder,
      lastUpdated,
      successMessage,
      errorMessage,
      isConfigured,
      formatDate,
      saveSettings,
      testSettings,
      showClearHistoryModal,
      isClearingHistory,
      clearType,
      clearHistory
    };
  }
};
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: var(--free-primary-color, #E1000F);
  font-weight: 600;
}

.page-icon {
  margin-right: 10px;
  width: 24px;
  height: 24px;
}

.card {
  background: var(--free-card-background);
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 10px var(--free-shadow);
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 25px;
  color: var(--free-primary-color, #E1000F);
  font-weight: 600;
  text-align: center;
  width: 100%;
}

.card-icon {
  margin-right: 10px;
  width: 24px;
  height: 24px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: var(--free-text-color-secondary);
}

.spinner {
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
  color: var(--free-primary-color, #E1000F);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.api-info {
  margin-bottom: 20px;
  color: var(--free-text-color-secondary);
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--free-text-color);
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--free-border-color);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--free-card-background);
  color: var(--free-text-color);
  transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--free-primary-color);
  box-shadow: 0 0 0 3px rgba(225, 0, 15, 0.1);
}

.form-control.is-invalid {
  border-color: var(--free-error-color);
}

.api-key-input {
  display: flex;
  position: relative;
}

.api-key-input .form-control {
  padding-right: 40px;
}

.toggle-visibility-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--free-text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.toggle-visibility-btn:hover {
  color: var(--free-primary-color);
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  justify-content: center;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 12px 24px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.btn-primary {
  background-color: var(--free-primary-color, #E1000F);
  color: white;
  min-width: 200px;
  justify-content: center;
}

.btn-primary:hover {
  background-color: #c5000d;
}

.btn-secondary {
  background-color: var(--free-card-background);
  color: var(--free-text-color);
  border: 1px solid var(--free-border-color);
}

.btn-secondary:hover {
  background-color: var(--free-border-color);
}

.btn-danger {
  background-color: var(--free-error-color, #dc3545);
  color: white;
  border: 1px solid var(--free-error-color, #dc3545);
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #c82333;
}

.btn-primary:disabled, .btn-secondary:disabled, .btn-danger:disabled {
  background-color: var(--free-border-color);
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-icon {
  flex-shrink: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: var(--free-card-background);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--free-border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--free-text-color);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--free-text-color-secondary);
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease, background-color 0.3s ease;
}

.close-btn:hover {
  color: var(--free-text-color);
  background-color: var(--free-border-color);
}

.modal-content {
  padding: 24px;
  text-align: center;
}

.warning-icon {
  color: var(--free-error-color, #dc3545);
  margin-bottom: 16px;
}

.modal-message {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--free-text-color);
  margin-bottom: 12px;
}

.modal-warning {
  color: var(--free-text-color-secondary);
  line-height: 1.5;
  margin-bottom: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--free-border-color);
  justify-content: flex-end;
}

.modal-actions .btn-secondary,
.modal-actions .btn-danger {
  padding: 10px 20px;
  font-size: 0.95rem;
  min-width: 120px;
  justify-content: center;
}

/* Clear Options Styles */
.clear-options {
  margin: 20px 0;
  text-align: left;
}

.option {
  margin-bottom: 16px;
  position: relative;
}

.option:last-child {
  margin-bottom: 0;
}

.option-radio {
  position: absolute;
  left: -9999px;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  cursor: pointer;
}

.option-label {
  display: block;
  padding: 16px 20px;
  background-color: var(--free-background-color);
  border: 2px solid var(--free-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.option-label:hover {
  border-color: var(--free-primary-color);
  background-color: rgba(225, 0, 15, 0.02);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(225, 0, 15, 0.1);
}

.option-radio:checked + .option-label {
  border-color: var(--free-primary-color);
  background-color: rgba(225, 0, 15, 0.08);
  box-shadow: 0 0 0 3px rgba(225, 0, 15, 0.1);
}

.option-radio:checked + .option-label::before {
  content: '✓';
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  color: var(--free-primary-color);
  font-weight: bold;
  font-size: 1.2rem;
}

.option-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-title {
  font-weight: 600;
  color: var(--free-text-color);
  font-size: 1rem;
}

.option-description {
  color: var(--free-text-color-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.last-updated {
  margin-top: 20px;
  font-size: 12px;
  color: var(--free-text-color-secondary);
  text-align: right;
}

.error-message {
  color: var(--free-error-color);
  font-size: 12px;
  margin-top: 4px;
}

.error-message.global {
  padding: 10px;
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--free-error-color);
  border-radius: 4px;
  margin-top: 20px;
}

.success-message {
  padding: 15px;
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--free-success-color);
  border: 1px solid var(--free-success-color);
  border-radius: 4px;
  text-align: center;
  margin-top: 20px;
}

/* Theme Selector Styles */
.theme-selector {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.theme-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid var(--free-border-color);
  border-radius: 8px;
  background: var(--free-card-background);
  color: var(--free-text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  min-height: 48px;
}

.theme-option:hover {
  border-color: var(--free-primary-color);
  background-color: rgba(225, 0, 15, 0.05);
}

.theme-option.active {
  border-color: var(--free-primary-color);
  background-color: rgba(225, 0, 15, 0.1);
  color: var(--free-primary-color);
}

.theme-option.active .theme-icon {
  color: var(--free-primary-color);
}

.theme-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  transition: color 0.3s ease;
}

.theme-description {
  margin-top: 12px;
}

.theme-description p {
  color: var(--free-text-color-secondary);
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
}

/* Mobile Responsive - Enhanced for all screen sizes */

/* Very small mobile devices (≤360px) */
@media (max-width: 360px) {
  .settings-container {
    padding: 12px 8px;
  }

  .page-title {
    font-size: 1.4rem;
    margin-bottom: 15px;
    text-align: center;
  }

  .page-icon {
    margin-right: 6px;
    width: 20px;
    height: 20px;
  }

  .card {
    padding: 15px 12px;
  }

  .card-title {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }

  .card-icon {
    width: 18px;
    height: 18px;
  }

  .api-info {
    margin-bottom: 15px;
    font-size: 14px;
    line-height: 1.4;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .form-control {
    padding: 12px 10px;
    font-size: 16px; /* Prevents zoom on iOS */
    border-radius: 6px;
    min-height: 44px; /* Touch-friendly */
  }

  .api-key-input .form-control {
    padding-right: 44px;
  }

  .toggle-visibility-btn {
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    min-width: 32px;
    min-height: 32px;
  }

  .form-actions {
    margin-top: 20px;
    gap: 10px;
    flex-direction: column;
  }

  .btn-primary, .btn-secondary, .btn-danger {
    width: 100%;
    padding: 14px 16px;
    font-size: 16px;
    min-height: 44px; /* Touch-friendly */
    border-radius: 6px;
    justify-content: center;
    min-width: auto;
  }

  .btn-icon {
    width: 16px;
    height: 16px;
  }

  .last-updated {
    margin-top: 15px;
    font-size: 12px;
    text-align: center;
  }

  .loading {
    padding: 30px 15px;
  }

  .loading .spinner {
    width: 32px;
    height: 32px;
  }

  .loading p {
    font-size: 14px;
    margin-top: 10px;
  }

  .error-message, .success-message {
    font-size: 14px;
    padding: 12px;
    margin-top: 15px;
    border-radius: 6px;
  }

  .theme-selector {
    gap: 6px;
    flex-direction: column;
  }

  .theme-option {
    padding: 12px;
    min-height: 44px;
    font-size: 14px;
  }

  .theme-icon {
    width: 16px;
    height: 16px;
  }

  .theme-description p {
    font-size: 12px;
  }

  /* Modal mobile styles */
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-width: 100%;
    border-radius: 8px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-content {
    padding: 16px;
  }

  .warning-icon svg {
    width: 36px;
    height: 36px;
  }

  .modal-message {
    font-size: 1rem;
  }

  .modal-warning {
    font-size: 14px;
  }

  .modal-actions {
    padding: 16px;
    flex-direction: column;
    gap: 8px;
  }

  .modal-actions .btn-secondary,
  .modal-actions .btn-danger {
    width: 100%;
    min-height: 44px;
    padding: 12px 16px;
    font-size: 16px;
  }

  /* Mobile clear options */
  .clear-options {
    margin: 16px 0;
  }

  .option {
    margin-bottom: 12px;
  }

  .option-label {
    padding: 12px 16px;
    border-radius: 6px;
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .option-title {
    font-size: 0.95rem;
  }

  .option-description {
    font-size: 0.85rem;
    line-height: 1.3;
  }
}

/* Small mobile devices (361px - 480px) */
@media (max-width: 480px) and (min-width: 361px) {
  .settings-container {
    padding: 16px 12px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .card {
    padding: 20px 15px;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .form-control {
    min-height: 44px;
    font-size: 16px; /* Prevents zoom */
  }

  .btn-primary, .btn-secondary, .btn-danger {
    min-height: 44px;
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
    gap: 12px;
  }

  .theme-selector {
    gap: 8px;
  }

  .theme-option {
    padding: 10px 12px;
    min-height: 44px;
    font-size: 14px;
  }

  .theme-icon {
    width: 18px;
    height: 18px;
  }

  /* Mobile clear options for small devices */
  .option-label {
    padding: 10px 16px;
    min-height: 44px;
  }

  .option-title {
    font-size: 0.9rem;
  }

  .option-description {
    font-size: 0.8rem;
  }
}

/* Medium mobile devices and tablets (481px - 767px) */
@media (max-width: 767px) and (min-width: 481px) {
  .form-actions {
    justify-content: center;
    gap: 15px;
  }

  .btn-primary, .btn-secondary, .btn-danger {
    min-width: 180px;
  }

  /* Medium mobile clear options */
  .option-label {
    padding: 14px 18px;
    min-height: 44px;
  }
}

/* Existing mobile optimization (≤768px) */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary, .btn-danger {
    width: 100%;
    justify-content: center;
  }
  
  .card-title {
    font-size: 1.4rem;
  }

  /* Touch-friendly form elements */
  .form-control,
  .btn-primary,
  .btn-secondary,
  .btn-danger,
  .toggle-visibility-btn {
    min-height: 44px;
  }

  .toggle-visibility-btn {
    min-width: 44px;
  }

  .theme-option {
    min-height: 44px;
    padding: 12px 14px;
  }

  .theme-selector {
    gap: 10px;
  }

  /* Touch-friendly clear options */
  .option-label {
    min-height: 44px;
    padding: 12px 18px;
  }
}
</style> 