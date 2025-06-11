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
              {{ isTesting ? 'Test en cours...' : 'Tester la configuration' }}
            </button>
          </div>
        </form>
        
        <div v-if="lastUpdated" class="last-updated">
          Dernière mise à jour: {{ formatDate(lastUpdated) }}
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

export default {
  setup() {
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
        
        successMessage.value = 'Test réussi ! Un SMS de test a été envoyé à votre téléphone.';
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          successMessage.value = '';
        }, 5000);
      } catch (error) {
        console.error('Error testing settings:', error);
        errorMessage.value = error.response?.data?.error || 'Le test a échoué. Vérifiez vos identifiants.';
      } finally {
        isTesting.value = false;
      }
    };
    
    // Load settings on mount
    onMounted(loadSettings);
    
    return {
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
      testSettings
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
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
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
  color: #666;
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
  color: #666;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.form-control.is-invalid {
  border-color: #dc3545;
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
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
}

.btn-primary {
  background-color: var(--free-primary-color, #E1000F);
  color: white;
  min-width: 200px;
  justify-content: center;
}

.btn-secondary {
  background-color: #f2f2f2;
  color: #333;
}

.btn-primary:disabled, .btn-secondary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-icon {
  flex-shrink: 0;
}

.last-updated {
  margin-top: 20px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.error-message.global {
  padding: 10px;
  background-color: #f8d7da;
  border-radius: 4px;
  margin-top: 20px;
}

.success-message {
  padding: 15px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 4px;
  text-align: center;
  margin-top: 20px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .card-title {
    font-size: 1.4rem;
  }
}
</style> 