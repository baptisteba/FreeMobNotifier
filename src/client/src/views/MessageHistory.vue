<template>
  <div class="history-container">
    <h1 class="page-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="page-icon">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
      Historique des messages
    </h1>

    <div class="cards-container">
      <!-- Scheduled Messages Card -->
      <div class="card scheduled-card">
        <h2 class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Messages programmés
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
        
        <div v-else class="message-list">
          <div v-for="message in filteredPendingMessages" :key="message._id" class="message-item scheduled-item" :class="messageStatusClass(message)">
            <div class="message-header">
              <div class="message-status">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            
            <div class="message-content">{{ message.content }}</div>
            
            <div class="message-details">
              <div v-if="message.recurrence === 'none'" class="detail-row">
                <span class="detail-label">Date d'envoi:</span>
                <span class="detail-value">{{ formatDate(message.sendAt) }}</span>
              </div>
              
              <div v-if="message.recurrence !== 'none'" class="detail-row">
                <span class="detail-label">Récurrence:</span>
                <span class="detail-value">{{ formatRecurrence(message) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sent Messages Card -->
      <div class="card sent-card">
        <h2 class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Messages envoyés
          <span class="count-badge">{{ filteredSentMessages.length }}</span>
        </h2>
        
        <div class="filter-section">
          <div class="filter-controls">
            <div class="filter-group">
              <label for="search-filter">Rechercher</label>
              <input 
                id="search-filter" 
                v-model="filter.search" 
                @input="filterSentMessages" 
                class="form-control" 
                placeholder="Rechercher un message..."
                type="text"
              />
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
        
        <div v-else-if="filteredSentMessages.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13"></path>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
          </svg>
          <p>Aucun message envoyé</p>
        </div>
        
        <div v-else class="sent-messages-table">
          <div class="table-header">
            <div class="status-column">Statut</div>
            <div class="date-column">Date et heure</div>
            <div class="message-column">Message</div>
          </div>
          
          <div class="table-body">
            <div v-for="(message, index) in paginatedSentMessages" :key="message._id" class="table-row">
              <div class="status-column">
                <div class="status-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sent-icon">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              </div>
              
              <div class="date-column">
                {{ formatDate(message.lastSent || message.sendAt) }}
              </div>
              
              <div class="message-column">
                <div class="message-preview" @click="toggleMessageExpand(message)">
                  {{ getTruncatedMessage(message.content) }}
                  <button v-if="isMessageTruncated(message.content)" class="expand-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
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
            <span class="modal-date">Envoyé le: {{ modalDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch, reactive } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const messages = ref([]);
    const isLoading = ref(true);
    const filter = ref({
      recurrence: 'all',
      search: ''
    });
    const expandedMessages = reactive({});
    
    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(7); // Number of items to show per page
    
    // Computed properties for the two message types
    const pendingMessages = computed(() => {
      return messages.value.filter(msg => msg.status === 'pending');
    });
    
    const filteredPendingMessages = computed(() => {
      if (filter.value.recurrence === 'all') {
        return pendingMessages.value;
      }
      return pendingMessages.value.filter(msg => msg.recurrence === filter.value.recurrence);
    });
    
    const sentMessages = computed(() => {
      return messages.value.filter(msg => msg.status === 'sent');
    });
    
    const filteredSentMessages = computed(() => {
      if (filter.value.search) {
        return sentMessages.value.filter(msg => msg.content.toLowerCase().includes(filter.value.search.toLowerCase()));
      }
      return sentMessages.value;
    });
    
    // Pagination computed properties
    const totalPages = computed(() => {
      return Math.ceil(filteredSentMessages.value.length / itemsPerPage.value);
    });
    
    const paginatedSentMessages = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredSentMessages.value.slice(start, end);
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
      modalDate.value = formatDate(message.lastSent || message.sendAt);
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
    
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if date is today or yesterday
      if (date.toDateString() === now.toDateString()) {
        return `Aujourd'hui, ${new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)}`;
      } else if (date.toDateString() === yesterday.toDateString()) {
        return `Hier, ${new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)}`;
      }
      
      // For other dates
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    // Format status
    const formatStatus = (status) => {
      const statusMap = {
        pending: 'En attente',
        sent: 'Envoyé',
        failed: 'Échoué',
        cancelled: 'Annulé'
      };
      
      return statusMap[status] || status;
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
    
    // Filter sent messages
    const filterSentMessages = () => {
      // Debounce to avoid excessive filtering on rapid typing
      clearTimeout(filterTimeout.value);
      filterTimeout.value = setTimeout(() => {
        currentPage.value = 1; // Reset to first page when filtering
      }, 300);
    };
    
    // Timeout reference for debouncing
    const filterTimeout = ref(null);
    
    // Watch for filter changes
    watch(() => filter.value.recurrence, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        fetchMessages();
      }
    });
    
    // Modal state
    const modalMessage = ref(null);
    const modalDate = ref(null);
    
    return {
      messages,
      pendingMessages,
      filteredPendingMessages,
      sentMessages,
      filteredSentMessages,
      paginatedSentMessages,
      isLoading,
      filter,
      expandedMessages,
      currentPage,
      totalPages,
      formatDate,
      formatStatus,
      formatRecurrence,
      messageStatusClass,
      isMessageTruncated,
      getTruncatedMessage,
      toggleMessageExpand,
      deleteMessage,
      fetchMessages,
      filterSentMessages,
      changePage,
      modalMessage,
      modalDate,
      closeModal
    };
  }
};
</script>

<style scoped>
.history-container {
  max-width: 1200px;
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
}

.filter-section {
  margin-bottom: 20px;
  flex-shrink: 0;
  width: 100%;
  height: auto;
  min-height: 70px;
  box-sizing: border-box;
}

.filter-controls {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  width: 100%;
  height: auto;
  box-sizing: border-box;
}

.filter-group {
  flex: 1;
  max-width: 250px;
  height: auto;
  min-height: 70px;
  box-sizing: border-box;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  min-height: 700px;
  display: flex;
  flex-direction: column;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 25px;
  color: var(--free-primary-color, #E1000F);
  flex-shrink: 0;
  height: 36px;
  min-height: 36px;
  width: 100%;
  box-sizing: border-box;
  font-weight: 600;
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
  background-color: #f0f0f0;
  color: #666;
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--free-primary-color, #E1000F);
  box-shadow: 0 0 0 3px rgba(225, 0, 15, 0.1);
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
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--free-primary-color, #E1000F);
  box-sizing: border-box;
}

.btn-refresh:hover {
  background-color: #f8f8f8;
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
  color: #666;
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
  color: #666;
  flex: 1;
  width: 100%;
  min-height: 300px;
  box-sizing: border-box;
}

.empty-state svg {
  margin-bottom: 15px;
  color: #ccc;
  animation: floatAnimation 3s ease-in-out infinite;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
}

@keyframes floatAnimation {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.empty-state p {
  color: #888;
  font-size: 16px;
  animation: fadeIn 1s ease;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 650px;
  overflow-y: auto;
}

.message-item {
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
}

.scheduled-item {
  min-height: auto;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.message-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 14px;
}

.message-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f2f2f2;
}

.delete-btn {
  color: var(--free-error-color, #F44336);
}

.message-content {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  max-height: 60px;
  overflow-y: auto;
}

.message-details {
  padding: 12px 15px;
  background-color: #fafafa;
  font-size: 13px;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  flex: 0 0 120px;
  font-weight: 600;
  color: #666;
}

.detail-value {
  flex: 1;
}

/* Sent Messages Table */
.sent-messages-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  animation: slideIn 0.3s ease;
  overflow: hidden;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-header {
  display: flex;
  background-color: #f5f5f5;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 48px;
  min-height: 48px;
  box-sizing: border-box;
}

.table-header .status-column,
.table-header .date-column,
.table-header .message-column {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.table-body {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #eee;
  width: 100%;
  transition: all 0.2s ease;
  min-height: 60px;
  height: auto;
  box-sizing: border-box;
}

.table-row:nth-child(even) {
  background-color: #f9f9f9;
}

.table-row:hover {
  background-color: #f0f7ff;
}

.table-row:last-child {
  border-bottom: none;
}

.status-column, .date-column, .message-column {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.status-column {
  flex: 0 0 60px;
  width: 60px;
  min-width: 60px;
  justify-content: center;
  border-right: 1px solid #eee;
}

.date-column {
  flex: 0 0 180px;
  width: 180px;
  min-width: 180px;
  border-right: 1px solid #eee;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.2;
}

.message-column {
  flex: 1;
  min-width: 0;
  flex-direction: column;
  padding-top: 8px;
  padding-bottom: 8px;
  width: calc(100% - 240px); /* 60px status + 180px date */
}

.sent-icon {
  color: #28a745;
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
}

.message-preview {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
  min-height: 28px;
  height: auto;
  box-sizing: border-box;
  border-radius: 4px;
}

.table-row:hover .message-preview {
  color: var(--free-primary-color, #E1000F);
  background-color: rgba(0, 0, 0, 0.02);
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  margin-left: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.expand-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--free-primary-color, #E1000F);
}

.expand-btn svg {
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
}

/* Status colors */
.status-pending .message-status {
  color: #ffc107;
}

.status-sent .message-status {
  color: #28a745;
}

.status-failed .message-status {
  color: #dc3545;
}

.status-cancelled .message-status {
  color: #6c757d;
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
    min-height: 130px;
  }
  
  .filter-group {
    width: 100%;
    max-width: none;
    min-height: 70px;
  }
  
  .btn-refresh {
    align-self: flex-start;
  }
  
  .detail-row {
    flex-direction: column;
  }
  
  .detail-label {
    margin-bottom: 4px;
  }
  
  .sent-messages-table {
    border-radius: 6px;
  }
  
  .table-header, .table-row {
    position: relative;
  }
  
  .status-column {
    flex: 0 0 40px;
    width: 40px;
    min-width: 40px;
  }
  
  .date-column {
    flex: 0 0 110px;
    width: 110px;
    min-width: 110px;
    font-size: 13px;
  }
  
  .message-column {
    padding-right: 10px;
    width: calc(100% - 150px); /* 40px status + 110px date */
  }
  
  .message-full {
    padding: 10px;
    margin-right: 5px;
    width: calc(100% - 15px);
  }
  
  .pagination-controls {
    padding: 10px;
    height: 50px;
    min-height: 50px;
  }
  
  .pagination-info {
    font-size: 12px;
  }
  
  .pagination-btn {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
  }
}

@media (max-width: 500px) {
  .card {
    padding: 15px;
  }
  
  .table-header, .table-row {
    flex-wrap: wrap;
    height: auto;
  }
  
  .table-header {
    min-height: 80px;
  }
  
  .table-row {
    min-height: 100px;
  }
  
  .status-column {
    flex: 0 0 40px;
    width: 40px;
    min-width: 40px;
    height: 40px;
    min-height: 40px;
  }
  
  .date-column {
    flex: 1;
    width: calc(100% - 40px);
    min-width: calc(100% - 40px);
    border-right: none;
    border-bottom: 1px solid #eee;
    height: 40px;
    min-height: 40px;
  }
  
  .message-column {
    flex: 0 0 100%;
    width: 100%;
    min-width: 100%;
    padding-left: 15px;
    min-height: 60px;
  }
  
  .message-full {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
  
  .pagination-controls {
    flex-direction: column;
    align-items: flex-end;
    height: auto;
    min-height: 80px;
    gap: 8px;
  }
  
  .pagination-info {
    margin-right: 0;
  }
}

.pagination-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 15px;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
  height: 60px;
  min-height: 60px;
  box-sizing: border-box;
}

.pagination-info {
  margin-right: 15px;
  color: #666;
  font-size: 14px;
}

.pagination-buttons {
  display: flex;
  gap: 5px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
  box-sizing: border-box;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f0f7ff;
  border-color: #ccc;
  color: var(--free-primary-color, #E1000F);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: var(--free-primary-color, #E1000F);
  font-weight: 600;
  font-size: 18px;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #666;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--free-primary-color, #E1000F);
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-message {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.modal-info {
  border-top: 1px solid #eee;
  padding-top: 15px;
  color: #666;
  font-size: 14px;
}

.modal-date {
  font-style: italic;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Improve modal responsiveness */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 80vh;
  }
  
  .modal-header {
    padding: 12px 15px;
  }
  
  .modal-content {
    padding: 15px;
  }
  
  .modal-message {
    font-size: 14px;
  }
}

:global(body.modal-open) {
  overflow: hidden;
}
</style> 