<template>
  <div class="home-container">
    <h1 class="page-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="page-icon">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      Accueil
    </h1>

    <div class="card">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          @click="activeTab = 'send'" 
          :class="['tab-btn', activeTab === 'send' ? 'active' : '']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">
            <path d="M22 2L11 13"></path>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
          </svg>
          Envoyer maintenant
        </button>
        <button 
          @click="activeTab = 'schedule'" 
          :class="['tab-btn', activeTab === 'schedule' ? 'active' : '']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Programmer
        </button>
      </div>

      <!-- Send Now Tab Content -->
      <div v-if="activeTab === 'send'" class="tab-content">
        <h2 class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
            <path d="M22 2L11 13"></path>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
          </svg>
          Envoyer un SMS
        </h2>
        
        <div class="form-group">
          <label for="message">Message</label>
          <textarea 
            id="message" 
            v-model="message" 
            class="form-control" 
            placeholder="Votre message (max 160 caractères)" 
            maxlength="160"
            :class="{'is-invalid': messageError}"
          ></textarea>
          <div v-if="messageError" class="error-message">{{ messageError }}</div>
          <div class="char-count">{{ message.length }}/160</div>
        </div>
        
        <div class="action-buttons">
          <button 
            class="btn-primary" 
            @click="sendMessage" 
            :disabled="isSending || !message.trim()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            {{ isSending ? 'Envoi en cours...' : 'Envoyer maintenant' }}
          </button>
        </div>
      </div>

      <!-- Schedule Tab Content -->
      <div v-if="activeTab === 'schedule'" class="tab-content">
        <h2 class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Programmer un message
        </h2>

        <div class="form-group">
          <label for="schedule-message">Message</label>
          <textarea 
            id="schedule-message" 
            v-model="scheduleMessage" 
            class="form-control" 
            placeholder="Votre message (max 160 caractères)" 
            maxlength="160"
            :class="{'is-invalid': scheduleMessageError}"
          ></textarea>
          <div v-if="scheduleMessageError" class="error-message">{{ scheduleMessageError }}</div>
          <div class="char-count">{{ scheduleMessage.length }}/160</div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label for="datetime">Date et heure d'envoi</label>
            <FreeDateTimePicker
              v-model="sendAt"
              :placeholder="'Sélectionnez une date et heure'"
              :format="formatDateTime"
            >
              <template #inputIcon>
                <CalendarIcon />
              </template>
            </FreeDateTimePicker>
            <div v-if="dateError" class="error-message">{{ dateError }}</div>
          </div>
        </div>

        <div class="form-group">
          <label>Récurrence</label>
          <div class="toggle-group">
            <button 
              @click="setRecurrence('none')" 
              :class="['toggle-btn', recurrence === 'none' ? 'active' : '']"
            >
              <CalendarIcon class="btn-icon" />
              Une fois
            </button>
            <button 
              @click="setRecurrence('daily')" 
              :class="['toggle-btn', recurrence === 'daily' ? 'active' : '']"
            >
              <CalendarIcon class="btn-icon" />
              Quotidien
            </button>
            <button 
              @click="setRecurrence('weekly')" 
              :class="['toggle-btn', recurrence === 'weekly' ? 'active' : '']"
            >
              <CalendarIcon class="btn-icon" />
              Hebdomadaire
            </button>
            <button 
              @click="setRecurrence('monthly')" 
              :class="['toggle-btn', recurrence === 'monthly' ? 'active' : '']"
            >
              <CalendarIcon class="btn-icon" />
              Mensuel
            </button>
          </div>
        </div>

        <!-- Weekly recurrence options -->
        <div v-if="recurrence === 'weekly'" class="form-group recurrence-options">
          <label>Jours de la semaine</label>
          <div class="days-select">
            <button 
              v-for="(day, index) in weekDays" 
              :key="index"
              @click="toggleWeekDay(index)"
              :class="['day-btn', selectedDaysOfWeek.includes(index) ? 'active' : '']"
            >
              {{ day.substr(0, 1) }}
            </button>
          </div>
        </div>

        <!-- Monthly recurrence options -->
        <div v-if="recurrence === 'monthly'" class="form-group recurrence-options">
          <label>Jour du mois</label>
          <select v-model="dayOfMonth" class="form-control">
            <option v-for="day in 31" :key="day" :value="day">{{ day }}</option>
          </select>
        </div>

        <div class="action-buttons">
          <button @click="scheduleMessageFunc" class="btn-primary" :disabled="isScheduling">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ isScheduling ? 'Programmation en cours...' : 'Programmer' }}
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
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import FreeDateTimePicker from '../components/FreeDateTimePicker.vue';
import CalendarIcon from '../components/icons/CalendarIcon.vue';

export default {
  components: {
    FreeDateTimePicker,
    CalendarIcon
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // Tab state
    const activeTab = ref('send');
    
    // Send message variables
    const message = ref('');
    const messageError = ref('');
    const isSending = ref(false);
    
    // Schedule message variables
    const scheduleMessage = ref('');
    const scheduleMessageError = ref('');
    const sendAt = ref(null);
    const recurrence = ref('none');
    const selectedDaysOfWeek = ref([]);
    const dayOfMonth = ref(new Date().getDate());
    const dateError = ref('');
    const isScheduling = ref(false);
    
    // Global state
    const errorMessage = ref('');
    const successMessage = ref('');
    
    const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    // Initialize message from query parameter if present
    onMounted(() => {
      if (route.query.message) {
        message.value = route.query.message;
        scheduleMessage.value = route.query.message;
      }
    });
    
    // Format date for display
    const formatDateTime = (date) => {
      if (!date) return '';
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    // Toggle day selection for weekly recurrence
    const toggleWeekDay = (dayIndex) => {
      const index = selectedDaysOfWeek.value.indexOf(dayIndex);
      if (index !== -1) {
        selectedDaysOfWeek.value.splice(index, 1);
      } else {
        selectedDaysOfWeek.value.push(dayIndex);
      }
    };
    
    // Set recurrence type
    const setRecurrence = (type) => {
      recurrence.value = type;
      
      // Initialize default values based on recurrence type
      if (type === 'weekly' && selectedDaysOfWeek.value.length === 0) {
        // Default to current day of week
        selectedDaysOfWeek.value = [new Date().getDay()];
      }
    };
    
    // Send message immediately
    const sendMessage = async () => {
      // Reset errors
      messageError.value = '';
      errorMessage.value = '';
      successMessage.value = '';
      
      // Validate
      if (!message.value.trim()) {
        messageError.value = 'Le message est requis';
        return;
      }
      
      // Send request
      try {
        isSending.value = true;
        const response = await axios.post('/api/messages/send', {
          content: message.value
        });
        
        successMessage.value = 'Message envoyé avec succès !';
        message.value = '';
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
        
      } catch (error) {
        console.error('Error sending message:', error);
        errorMessage.value = error.response?.data?.error || 'Une erreur est survenue lors de l\'envoi du message';
      } finally {
        isSending.value = false;
      }
    };
    
    // Schedule message
    const scheduleMessageFunc = async () => {
      // Reset errors
      scheduleMessageError.value = '';
      dateError.value = '';
      errorMessage.value = '';
      
      // Validate form
      let isValid = true;
      
      if (!scheduleMessage.value.trim()) {
        scheduleMessageError.value = 'Le message est requis';
        isValid = false;
      }
      
      if (!sendAt.value) {
        dateError.value = 'La date d\'envoi est requise';
        isValid = false;
      } else if (new Date(sendAt.value) < new Date()) {
        dateError.value = 'La date d\'envoi doit être dans le futur';
        isValid = false;
      }
      
      if (recurrence.value === 'weekly' && selectedDaysOfWeek.value.length === 0) {
        errorMessage.value = 'Veuillez sélectionner au moins un jour de la semaine';
        isValid = false;
      }
      
      if (!isValid) return;
      
      // Prepare recurrence config
      const recurrenceConfig = {};
      
      if (recurrence.value === 'weekly') {
        recurrenceConfig.daysOfWeek = selectedDaysOfWeek.value;
      } else if (recurrence.value === 'monthly') {
        recurrenceConfig.dayOfMonth = dayOfMonth.value;
      }
      
      // Add time components
      if (recurrence.value !== 'none') {
        const dateObj = new Date(sendAt.value);
        recurrenceConfig.hour = dateObj.getHours();
        recurrenceConfig.minute = dateObj.getMinutes();
      }
      
      // Prepare request data
      const messageData = {
        content: scheduleMessage.value,
        sendAt: sendAt.value,
        recurrence: recurrence.value,
        recurrenceConfig: Object.keys(recurrenceConfig).length > 0 ? recurrenceConfig : undefined
      };
      
      // Send request
      try {
        isScheduling.value = true;
        const response = await axios.post('/api/messages/schedule', messageData);
        
        successMessage.value = 'Message programmé avec succès !';
        
        // Reset form after successful submission
        scheduleMessage.value = '';
        sendAt.value = null;
        recurrence.value = 'none';
        selectedDaysOfWeek.value = [];
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      } catch (error) {
        console.error('Error scheduling message:', error);
        errorMessage.value = error.response?.data?.error || 'Une erreur est survenue lors de la programmation du message';
      } finally {
        isScheduling.value = false;
      }
    };
    
    return {
      activeTab,
      message,
      messageError,
      isSending,
      scheduleMessage,
      scheduleMessageError,
      sendAt,
      recurrence,
      selectedDaysOfWeek,
      dayOfMonth,
      weekDays,
      dateError,
      isScheduling,
      errorMessage,
      successMessage,
      formatDateTime,
      toggleWeekDay,
      setRecurrence,
      sendMessage,
      scheduleMessageFunc
    };
  }
};
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  overflow: visible;
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
  padding: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: visible;
  position: relative;
  z-index: 1;
}

.tab-navigation {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 18px 20px;
  border: none;
  background: #f9f9f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  color: #666;
  font-weight: 500;
  font-size: 1.1rem;
}

.tab-btn:hover {
  background-color: #f0f0f0;
}

.tab-btn.active {
  background-color: white;
  color: var(--free-primary-color, #E1000F);
  border-bottom: 3px solid var(--free-primary-color, #E1000F);
  font-weight: 600;
}

.tab-icon {
  width: 20px;
  height: 20px;
}

.tab-content {
  padding: 30px;
  overflow: visible;
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

.form-group {
  margin-bottom: 20px;
}

.full-width {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  font-size: 1.05rem;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--free-primary-color, #E1000F);
  box-shadow: 0 0 0 3px rgba(225, 0, 15, 0.1);
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.char-count {
  text-align: right;
  font-size: 13px;
  color: #666;
  margin-top: 6px;
}

.toggle-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.toggle-btn {
  flex: 1;
  min-width: 130px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1rem;
}

.toggle-btn.active {
  background-color: var(--free-primary-color, #E1000F);
  color: white;
  border-color: var(--free-primary-color, #E1000F);
  font-weight: 600;
}

.toggle-btn.active .btn-icon {
  color: white;
}

.btn-icon {
  margin-right: 6px;
}

.recurrence-options {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  margin-top: -10px;
}

.days-select {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.day-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
}

.day-btn.active {
  background-color: var(--free-primary-color, #E1000F);
  color: white;
  border-color: var(--free-primary-color, #E1000F);
}

.action-buttons {
  display: flex;
  gap: 10px;
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
  text-decoration: none;
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

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
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
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .toggle-btn {
    min-width: auto;
    flex: 1 0 40%;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    justify-content: center;
  }
  
  .tab-btn {
    padding: 15px 15px;
    font-size: 1rem;
  }
  
  .card-title {
    font-size: 1.4rem;
  }
  
  .btn-primary {
    width: 100%;
  }
}

/* Ensure datetime picker displays above everything */
:deep(.datetime-picker) {
  position: relative;
  z-index: 100;
}

:deep(.datetime-picker-popup) {
  z-index: 1000 !important; 
  position: absolute !important;
}

:deep(.datetime-picker-popup-overlay) {
  z-index: 999 !important;
}

:deep(.datetime-picker-input) {
  position: relative;
  z-index: 10;
}
</style> 