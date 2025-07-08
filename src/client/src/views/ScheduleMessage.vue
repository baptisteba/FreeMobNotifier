<template>
  <div class="schedule-container">
    <h1 class="page-title">
      <TimeIcon class="page-icon" />
      Programmer un message
    </h1>

    <div class="card">
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

      <div class="form-row">
        <div class="form-group full-width">
          <label for="datetime">Date et heure d'envoi</label>
          <FreeDateTimePicker
            v-model="sendAt"
            :dark="isDarkMode"
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

      <div class="form-actions">
        <button @click="goBack" class="btn-secondary">
          <i class="fas fa-arrow-left"></i> Annuler
        </button>
        <button @click="scheduleMessage" class="btn-primary" :disabled="isSending">
          <i class="fas fa-paper-plane"></i> {{ isSending ? 'Envoi en cours...' : 'Programmer' }}
        </button>
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
import TimeIcon from '../components/icons/TimeIcon.vue';
import { useTheme } from '../composables/useTheme.js';

export default {
  components: {
    FreeDateTimePicker,
    CalendarIcon,
    TimeIcon
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { isDarkMode } = useTheme();
    
    const message = ref('');
    const sendAt = ref(null); // Empty by default
    const recurrence = ref('none');
    const selectedDaysOfWeek = ref([]);
    const dayOfMonth = ref(new Date().getDate());
    
    const messageError = ref('');
    const dateError = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const isSending = ref(false);
    
    const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    // Initialize message from query parameter if present
    onMounted(() => {
      if (route.query.message) {
        message.value = route.query.message;
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
    
    // Schedule message
    const scheduleMessage = async () => {
      // Reset errors
      messageError.value = '';
      dateError.value = '';
      errorMessage.value = '';
      
      // Validate form
      let isValid = true;
      
      if (!message.value.trim()) {
        messageError.value = 'Le message est requis';
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
        content: message.value,
        sendAt: sendAt.value,
        recurrence: recurrence.value,
        recurrenceConfig: Object.keys(recurrenceConfig).length > 0 ? recurrenceConfig : undefined
      };
      
      // Send request
      try {
        isSending.value = true;
        const response = await axios.post('/api/messages/schedule', messageData);
        
        successMessage.value = 'Message programmé avec succès !';
        
        // Reset form after successful submission
        message.value = '';
        sendAt.value = null;
        recurrence.value = 'none';
        selectedDaysOfWeek.value = [];
        
        // Navigate to home after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Error scheduling message:', error);
        errorMessage.value = error.response?.data?.error || 'Une erreur est survenue lors de la programmation du message';
      } finally {
        isSending.value = false;
      }
    };
    
    const goBack = () => {
      router.push('/');
    };
    
    return {
      isDarkMode,
      message,
      sendAt,
      recurrence,
      selectedDaysOfWeek,
      dayOfMonth,
      weekDays,
      messageError,
      dateError,
      errorMessage,
      successMessage,
      isSending,
      formatDateTime,
      toggleWeekDay,
      setRecurrence,
      scheduleMessage,
      goBack
    };
  }
};
</script>

<style scoped>
.schedule-container {
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
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
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
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--free-text-color);
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
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
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.toggle-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.toggle-btn {
  flex: 1;
  min-width: 120px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toggle-btn.active {
  background-color: var(--free-primary-color, #E1000F);
  color: white;
  border-color: var(--free-primary-color, #E1000F);
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
  gap: 8px;
}

.day-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.day-btn.active {
  background-color: var(--free-primary-color, #E1000F);
  color: white;
  border-color: var(--free-primary-color, #E1000F);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background-color: var(--free-primary-color, #E1000F);
  color: white;
}

.btn-secondary {
  background-color: #f2f2f2;
  color: #333;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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

/* Mobile Responsive - Enhanced for all screen sizes */

/* Very small mobile devices (≤360px) */
@media (max-width: 360px) {
  .schedule-container {
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

  textarea.form-control {
    min-height: 80px;
  }

  .char-count {
    font-size: 12px;
    margin-top: 4px;
  }

  .toggle-group {
    gap: 8px;
    flex-direction: column;
  }

  .toggle-btn {
    min-width: auto;
    width: 100%;
    padding: 12px 10px;
    font-size: 14px;
    min-height: 44px; /* Touch-friendly */
    border-radius: 6px;
  }

  .btn-icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }

  .recurrence-options {
    padding: 12px;
    margin-top: -8px;
  }

  .days-select {
    gap: 6px;
    justify-content: space-around;
    flex-wrap: wrap;
  }

  .day-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
    border-radius: 6px;
  }

  .form-actions {
    margin-top: 20px;
    gap: 10px;
    flex-direction: column-reverse;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    padding: 14px 16px;
    font-size: 16px;
    min-height: 44px; /* Touch-friendly */
    border-radius: 6px;
    justify-content: center;
  }

  .error-message, .success-message {
    font-size: 14px;
    padding: 12px;
    margin-top: 15px;
    border-radius: 6px;
  }
}

/* Small mobile devices (361px - 480px) */
@media (max-width: 480px) and (min-width: 361px) {
  .schedule-container {
    padding: 16px 12px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .card {
    padding: 20px 15px;
  }

  .toggle-group {
    flex-direction: column;
    gap: 10px;
  }

  .toggle-btn {
    width: 100%;
    min-height: 44px;
  }

  .form-control {
    min-height: 44px;
    font-size: 16px; /* Prevents zoom */
  }

  .btn-primary, .btn-secondary {
    min-height: 44px;
    width: 100%;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }
}

/* Medium mobile devices and tablets (481px - 767px) */
@media (max-width: 767px) and (min-width: 481px) {
  .toggle-group {
    gap: 10px;
  }

  .toggle-btn {
    flex: 1 0 45%;
    min-width: 150px;
  }

  .form-actions {
    gap: 15px;
  }
}

/* Existing mobile optimization (≤768px) */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .toggle-btn {
    min-width: auto;
    flex: 1 0 40%;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  /* Touch-friendly form elements */
  .form-control,
  .toggle-btn,
  .btn-primary,
  .btn-secondary {
    min-height: 44px;
  }

  .day-btn {
    min-width: 36px;
    min-height: 36px;
  }
}
</style> 