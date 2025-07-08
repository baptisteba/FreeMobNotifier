<template>
  <div class="scheduled-container">
    <h1 class="page-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="page-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      Messages programmés
    </h1>

    <div class="card scheduled-card">
      <h2 class="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Messages en attente
        <span class="count-badge">{{ filteredPendingMessages.length }}</span>
      </h2>
      
      <div class="filter-section">
        <div class="filter-controls">
          <div class="filter-group">
            <label for="recurrence-filter">Récurrence</label>
            <select id="recurrence-filter" v-model="filter.recurrence" @change="fetchMessages" class="form-control">
              <option value="all">Tous les types</option>
              <option value="none">Une fois</option>
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
            </select>
          </div>
          
          <button @click="fetchMessages" class="btn-refresh" title="Rafraîchir">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
      </div>
      
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
      </div>
      
      <div v-else-if="filteredPendingMessages.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <path d="M8 14h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 14h.01"></path>
          <path d="M8 18h.01"></path>
          <path d="M12 18h.01"></path>
          <path d="M16 18h.01"></path>
        </svg>
        <p>Aucun message programmé</p>
      </div>
      
      <div v-else class="scheduled-messages-container">
        <div class="scheduled-message-list">
          <div v-for="message in paginatedScheduledMessages" :key="message._id" class="scheduled-message-card">
            <div class="scheduled-message-header">
              <div class="message-status pending">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pending-icon">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>En attente</span>
              </div>
              <div class="message-actions">
                <button @click="deleteMessage(message._id)" class="action-btn delete-btn" title="Supprimer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="scheduled-message-content">
              <div class="message-text" @click="toggleMessageExpand(message)">
                {{ getTruncatedMessage(message.content) }}
                <button v-if="isMessageTruncated(message.content)" class="expand-btn" title="Voir le message complet">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
              
              <div class="message-details">
                <div v-if="message.recurrence === 'none'" class="detail-row inline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span class="detail-value compact">{{ formatCompactDate(message.sendAt) }}</span>
                </div>
                
                <div v-if="message.recurrence !== 'none'" class="detail-row inline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span class="detail-value compact">{{ formatRecurrence(message) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination-controls">
          <div class="pagination-info">
            Page {{ currentPage }} sur {{ totalPages }}
          </div>
          <div class="pagination-buttons">
            <button 
              @click="changePage(1)" 
              class="pagination-btn" 
              :disabled="currentPage === 1" 
              title="Première page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            </button>
            <button 
              @click="changePage(currentPage - 1)" 
              class="pagination-btn" 
              :disabled="currentPage === 1"
              title="Page précédente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              @click="changePage(currentPage + 1)" 
              class="pagination-btn" 
              :disabled="currentPage === totalPages"
              title="Page suivante"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <button 
              @click="changePage(totalPages)" 
              class="pagination-btn" 
              :disabled="currentPage === totalPages"
              title="Dernière page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for full message display -->
    <div v-if="modalMessage" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Message complet</h3>
          <button class="modal-close-btn" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="modal-message">{{ modalMessage }}</div>
          <div class="modal-info">
            <span class="modal-date">Programmé pour: {{ modalDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const messages = ref([]);
    const isLoading = ref(true);
    const filter = ref({
      recurrence: 'all'
    });
    
    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(7); // Number of items to show per page
    
    // Computed properties for pending messages
    const pendingMessages = computed(() => {
      return messages.value.filter(msg => msg.status === 'pending');
    });
    
    const filteredPendingMessages = computed(() => {
      if (filter.value.recurrence === 'all') {
        return pendingMessages.value;
      }
      return pendingMessages.value.filter(msg => msg.recurrence === filter.value.recurrence);
    });
    
    // Pagination computed properties
    const totalPages = computed(() => {
      return Math.ceil(filteredPendingMessages.value.length / itemsPerPage.value);
    });
    
    const paginatedScheduledMessages = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredPendingMessages.value.slice(start, end);
    });
    
    // Change page
    const changePage = (page) => {
      currentPage.value = page;
    };
    
    // Check if message should be truncated
    const isMessageTruncated = (content) => {
      return content && content.length > 25;
    };
    
    // Get truncated message text
    const getTruncatedMessage = (content) => {
      if (!content) return '';
      if (content.length <= 25) return content;
      return content.substring(0, 25) + '...';
    };
    
    // Toggle message expand state (now opens modal)
    const toggleMessageExpand = (message) => {
      modalMessage.value = message.content;
      modalDate.value = message.recurrence === 'none' 
        ? formatCompactDate(message.sendAt) 
        : formatRecurrence(message);
      // Add animation class to body to prevent scrolling when modal is open
      document.body.classList.add('modal-open');
    };
    
    // Close modal
    const closeModal = () => {
      modalMessage.value = null;
      modalDate.value = null;
      document.body.classList.remove('modal-open');
    };
    
    // Handle keyboard events for modal (ESC to close)
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalMessage.value) {
        closeModal();
      }
    };
    
    // Setup event listeners when component is mounted
    onMounted(() => {
      fetchMessages();
      window.addEventListener('keydown', handleKeyDown);
    });
    
    // Cleanup event listeners when component is unmounted
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown);
      // Make sure to remove modal-open class if component is unmounted with modal open
      document.body.classList.remove('modal-open');
    });
    
    // Fetch messages
    const fetchMessages = async () => {
      try {
        isLoading.value = true;
        const response = await axios.get('/api/messages');
        messages.value = response.data;
        currentPage.value = 1; // Reset to first page when fetching new data
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Format compact date for scheduled messages
    const formatCompactDate = (dateString) => {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const timeStr = new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
      // Check if date is today, tomorrow, or yesterday
      if (date.toDateString() === now.toDateString()) {
        return `Aujourd'hui ${timeStr}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Demain ${timeStr}`;
      } else if (date.toDateString() === yesterday.toDateString()) {
        return `Hier ${timeStr}`;
      }
      
      // Check if it's within this week
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      if (date >= startOfWeek && date < endOfWeek) {
        const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date);
        return `${dayName} ${timeStr}`;
      }
      
      // For other dates, show compact format
      const sameYear = date.getFullYear() === now.getFullYear();
      if (sameYear) {
        return new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } else {
        return new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }
    };
    
    // Format recurrence
    const formatRecurrence = (message) => {
      if (!message.recurrence || message.recurrence === 'none') {
        return 'Une seule fois';
      }
      
      const config = message.recurrenceConfig || {};
      let result = '';
      
      switch (message.recurrence) {
        case 'daily':
          result = 'Quotidien';
          break;
        case 'weekly':
          result = 'Hebdomadaire';
          if (config.daysOfWeek && config.daysOfWeek.length > 0) {
            const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
            const selectedDays = config.daysOfWeek.map(day => days[day]).join(', ');
            result += ` (${selectedDays})`;
          }
          break;
        case 'monthly':
          result = 'Mensuel';
          if (config.dayOfMonth) {
            result += ` (Jour ${config.dayOfMonth})`;
          }
          break;
        default:
          result = message.recurrence;
      }
      
      // Add time if available
      if (config.hour !== undefined && config.minute !== undefined) {
        const hour = String(config.hour).padStart(2, '0');
        const minute = String(config.minute).padStart(2, '0');
        result += ` à ${hour}:${minute}`;
      }
      
      return result;
    };
    
    // Message status class
    const messageStatusClass = (message) => {
      return {
        'status-pending': message.status === 'pending',
        'status-sent': message.status === 'sent',
        'status-failed': message.status === 'failed',
        'status-cancelled': message.status === 'cancelled'
      };
    };
    
    // Delete a message
    const deleteMessage = async (messageId) => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce message ?')) {
        return;
      }
      
      try {
        await axios.delete(`/api/messages/${messageId}`);
        await fetchMessages(); // Refresh the list
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Impossible de supprimer le message.');
      }
    };
    
    // Watch for filter changes
    watch(() => filter.value.recurrence, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        fetchMessages();
        currentPage.value = 1; // Reset to first page when filter changes
      }
    });
    
    // Modal state
    const modalMessage = ref(null);
    const modalDate = ref(null);
    
    return {
      messages,
      pendingMessages,
      filteredPendingMessages,
      paginatedScheduledMessages,
      isLoading,
      filter,
      currentPage,
      totalPages,
      formatCompactDate,
      formatRecurrence,
      messageStatusClass,
      isMessageTruncated,
      getTruncatedMessage,
      toggleMessageExpand,
      deleteMessage,
      fetchMessages,
      changePage,
      modalMessage,
      modalDate,
      closeModal
    };
  }
};
</script>

<style scoped>
.scheduled-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: var(--free-primary-color, #E1000F);
  font-weight: 700;
  text-align: center;
}

.page-icon {
  margin-right: 10px;
}

.card, .scheduled-card {
  background: var(--free-card-background);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 10px var(--free-shadow);
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* Desktop styles */
@media (min-width: 769px) {
  .card, .scheduled-card {
    padding: 25px;
    min-height: 500px;
  }
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 25px;
  color: var(--free-primary-color, #E1000F);
  flex-shrink: 0;
  font-weight: 700;
  text-align: center;
}

.card-icon {
  margin-right: 10px;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
}

.count-badge {
  margin-left: 10px;
  background-color: var(--free-background-color);
  color: var(--free-text-color-secondary);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.8rem;
  font-weight: normal;
  height: 20px;
  min-height: 20px;
  min-width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--free-border-color);
}

.filter-section {
  margin-bottom: 20px;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  width: 100%;
  box-sizing: border-box;
}

.filter-group {
  flex: 1;
  box-sizing: border-box;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--free-text-color);
}

.form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--free-border-color);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--free-text-color);
  background-color: var(--free-card-background);
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px var(--free-shadow);
}

.form-control:hover {
  border-color: var(--free-primary-color);
  box-shadow: 0 2px 6px var(--free-shadow);
}

.form-control:focus {
  outline: none;
  border-color: var(--free-primary-color, #E1000F);
  box-shadow: 0 0 0 3px rgba(225, 0, 15, 0.1), 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Enhanced Select Styling */
select.form-control {
  cursor: pointer;
  background-color: var(--free-card-background);
  color: var(--free-text-color);
  /* Improve select appearance for dark mode */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

/* Dark mode select arrow */
:root.dark-theme select.form-control {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23e0e0e0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
}

select.form-control option {
  padding: 8px;
  color: var(--free-text-color);
  background-color: var(--free-card-background);
}

.btn-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  min-width: 42px;
  min-height: 42px;
  border-radius: 4px;
  border: 1px solid var(--free-border-color);
  background-color: var(--free-card-background);
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--free-primary-color, #E1000F);
  box-sizing: border-box;
}

.btn-refresh:hover {
  background-color: var(--free-border-color);
}

.btn-refresh svg {
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--free-text-color-secondary);
  flex: 1;
  width: 100%;
  min-height: 300px;
  box-sizing: border-box;
}

.spinner {
  animation: spin 1s linear infinite;
  color: var(--free-primary-color, #E1000F);
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: var(--free-text-color-secondary);
  flex: 1;
  width: 100%;
  min-height: 300px;
  box-sizing: border-box;
}

.empty-state svg {
  margin-bottom: 15px;
  color: var(--free-border-color);
  animation: floatAnimation 3s ease-in-out infinite;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
}

@keyframes floatAnimation {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.empty-state p {
  color: var(--free-text-color-secondary);
  font-size: 16px;
  animation: fadeIn 1s ease;
}

.scheduled-messages-container {
  display: flex;
  flex-direction: column;
}

/* Desktop styles */
@media (min-width: 769px) {
  .scheduled-messages-container {
    gap: 20px;
  }
}

.scheduled-message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.scheduled-message-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.scheduled-message-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.scheduled-message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
}

.message-status.pending {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: white;
}

.pending-icon {
  color: white;
}

.message-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.delete-btn {
  color: white;
}

.delete-btn:hover {
  background-color: rgba(244, 67, 54, 0.8);
  border-color: rgba(244, 67, 54, 0.6);
}

.scheduled-message-content {
  padding: 20px;
  background: white;
}

.message-text {
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  transition: background-color 0.2s;
  word-break: break-word;
}

.message-text:hover {
  background: #e9ecef;
}

.expand-btn {
  background: none;
  border: none;
  color: var(--free-primary-color, #E1000F);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: auto;
}

.expand-btn:hover {
  background-color: rgba(225, 0, 15, 0.1);
  transform: scale(1.1);
}

.message-details {
  padding: 12px;
  background-color: #f1f3f4;
  border-radius: 6px;
  margin-top: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row.inline {
  gap: 6px;
  font-size: 12px;
}

.detail-icon {
  color: #666;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}

.detail-value {
  flex: 1;
  color: #333;
}

.detail-value.compact {
  font-weight: 500;
  color: #555;
  font-size: 12px;
}

/* Pagination Controls */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
}

/* Desktop styles */
@media (min-width: 769px) {
  .pagination-controls {
    padding: 20px;
    margin-top: 20px;
  }
}

.pagination-info {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.pagination-buttons {
  display: flex;
  gap: 8px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--free-primary-color, #E1000F);
  color: white;
  border-color: var(--free-primary-color, #E1000F);
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background-color: #f5f5f5;
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
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 90%;
  max-height: 80%;
  width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #666;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background-color: #e9ecef;
  color: #333;
}

.modal-content {
  padding: 20px;
}

.modal-message {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.modal-info {
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.modal-date {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* Prevent body scroll when modal is open */
body.modal-open {
  overflow: hidden;
}

/* Mobile Responsive */
@media (max-width: 360px) {
  .scheduled-container {
    padding: 12px 8px;
  }

  .page-title {
    font-size: 1.4rem;
    margin-bottom: 15px;
    text-align: center;
    justify-content: center;
  }

  .page-icon {
    margin-right: 6px;
    width: 20px;
    height: 20px;
  }

  .card {
    padding: 12px;
  }

  .card-title {
    font-size: 1.2rem;
    margin-bottom: 15px;
    flex-wrap: wrap;
    height: auto;
    line-height: 1.3;
  }

  .card-icon {
    width: 18px;
    height: 18px;
  }

  .count-badge {
    font-size: 0.7rem;
    padding: 1px 6px;
    margin-left: 6px;
    margin-top: 2px;
  }

  .filter-controls {
    flex-direction: row;
    gap: 10px;
    align-items: flex-end;
  }
  
  .filter-group {
    flex: 1;
  }

  .form-control {
    min-height: 44px;
    box-sizing: border-box;
  }

  /* Mobile form control enhancement */
  .form-control {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 14px 16px;
    border-radius: 8px;
  }

  .btn-refresh {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    min-height: 44px;
    margin-bottom: 0;
  }

  .scheduled-message-list {
    gap: 12px;
  }

  .scheduled-message-card {
    border-radius: 8px;
  }

  .scheduled-message-header {
    padding: 12px 16px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
  }

  .scheduled-message-content {
    padding: 16px;
  }

  .message-text {
    font-size: 14px;
    padding: 10px;
  }

  .message-details {
    padding: 10px;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .pagination-buttons {
    gap: 6px;
  }

  .pagination-btn {
    width: 36px;
    height: 36px;
  }

  .modal-container {
    width: 95%;
    margin: 10px;
  }

  .modal-header,
  .modal-content {
    padding: 16px;
  }
}

/* Small mobile devices (361px - 480px) */
@media (max-width: 480px) and (min-width: 361px) {
  .scheduled-container {
    padding: 16px 12px;
  }

  .page-title {
    font-size: 1.6rem;
    justify-content: center;
  }

  .card {
    padding: 18px;
  }

  .card-title {
    font-size: 1.3rem;
  }

  /* Small mobile form control */
  .form-control {
    padding: 12px 14px;
    font-size: 15px;
    border-radius: 6px;
  }

  .scheduled-message-list {
    gap: 14px;
  }

  .scheduled-message-card {
    border-radius: 10px;
  }

  .scheduled-message-header {
    padding: 7px 18px;
  }

  .action-btn {
    width: 34px;
    height: 34px;
  }

  .scheduled-message-content {
    padding: 18px;
  }

  .message-text {
    font-size: 15px;
    padding: 11px;
  }

  .pagination-controls {
    padding: 18px;
  }

  .pagination-btn {
    width: 38px;
    height: 38px;
  }

  .modal-container {
    width: 90%;
  }
}

@media (min-width: 481px) and (max-width: 767px) {
  .scheduled-container {
    padding: 20px 16px;
  }

  .card-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .filter-controls {
    width: 100%;
  }

  /* Medium mobile form control */
  .form-control {
    padding: 13px 15px;
    font-size: 15px;
    border-radius: 7px;
  }

  .scheduled-message-list {
    gap: 15px;
  }

  .scheduled-message-card {
    border-radius: 11px;
  }

  .scheduled-message-header {
    padding: 15px 19px;
  }

  .action-btn {
    width: 35px;
    height: 35px;
  }

  .scheduled-message-content {
    padding: 19px;
  }

  .message-text {
    padding: 11px;
  }

  .pagination-controls {
    padding: 19px;
  }

  .pagination-btn {
    width: 39px;
    height: 39px;
  }

  .modal-container {
    width: 85%;
  }
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: row;
    gap: 10px;
    align-items: flex-end;
  }
  
  .filter-group {
    flex: 1;
  }
  
  .btn-refresh {
    flex-shrink: 0;
    margin-bottom: 0;
  }

  .form-control {
    font-size: 16px; /* Prevents zoom on iOS */
    box-sizing: border-box;
    min-height: 44px;
  }

  .btn-refresh {
    min-height: 44px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 