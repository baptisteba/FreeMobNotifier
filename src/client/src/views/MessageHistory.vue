<template>
  <div class="history-container">
    <h1 class="page-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="page-icon">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
      Historique des messages
    </h1>

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
        
        <div v-else class="sent-messages-container">
          <div class="sent-message-list">
            <div v-for="(message, index) in paginatedSentMessages" :key="message._id" class="sent-message-card">
              <div class="sent-message-header">
                <div class="message-status sent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sent-icon">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Envoyé</span>
                </div>
                <div class="message-date">
                  {{ formatDate(message.lastSent || message.sendAt) }}
                </div>
              </div>
              
              <div class="sent-message-content">
                <div class="message-text" @click="toggleMessageExpand(message)">
                  {{ getTruncatedMessage(message.content) }}
                  <button v-if="isMessageTruncated(message.content)" class="expand-btn" title="Voir le message complet">
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
      search: ''
    });
    const expandedMessages = reactive({});
    
    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(7); // Number of items to show per page
    
    // Computed properties for sent messages only
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
    
    // Modal state
    const modalMessage = ref(null);
    const modalDate = ref(null);
    
    return {
      messages,
      sentMessages,
      filteredSentMessages,
      paginatedSentMessages,
      isLoading,
      filter,
      expandedMessages,
      currentPage,
      totalPages,
      formatDate,
      isMessageTruncated,
      getTruncatedMessage,
      toggleMessageExpand,
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

.card, .sent-card {
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
  .card, .sent-card {
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
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease, color 0.3s ease;
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
  border: 1px solid var(--free-border-color);
  background-color: var(--free-card-background);
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--free-primary-color, #E1000F);
  box-sizing: border-box;
}

.btn-refresh:hover {
  background-color: var(--free-background-color);
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
  color: var(--free-text-color-secondary);
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
  border: 1px solid var(--free-border-color);
  overflow: hidden;
  background-color: var(--free-card-background);
  transition: background-color 0.3s ease;
}

.scheduled-item {
  min-height: auto;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: var(--free-background-color);
  border-bottom: 1px solid var(--free-border-color);
}

.message-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 14px;
  color: var(--free-text-color);
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
  border: 1px solid var(--free-border-color);
  background-color: var(--free-card-background);
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--free-text-color);
}

.action-btn:hover {
  background-color: var(--free-background-color);
}

.delete-btn {
  color: var(--free-error-color, #F44336);
}

.message-content {
  padding: 12px 15px;
  border-bottom: 1px solid var(--free-border-color);
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  max-height: 60px;
  overflow-y: auto;
  color: var(--free-text-color);
  background-color: var(--free-card-background);
}

.message-details {
  padding: 8px 15px;
  background-color: var(--free-background-color);
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
  color: var(--free-text-color-secondary);
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}

.detail-label {
  flex: 0 0 120px;
  font-weight: 600;
  color: var(--free-text-color-secondary);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  flex: 1;
  color: var(--free-text-color);
}

.detail-value.compact {
  font-weight: 500;
  color: var(--free-text-color);
  font-size: 12px;
}

/* Sent Messages Cards */
.sent-messages-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  animation: slideIn 0.3s ease;
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

.sent-message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.sent-message-card {
  background: var(--free-card-background);
  border-radius: 12px;
  border: 1px solid var(--free-border-color);
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--free-shadow);
  padding: 0;
}

.sent-message-card:hover {
  box-shadow: 0 4px 16px var(--free-shadow);
  transform: translateY(-1px);
}

.sent-message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--free-success-color) 0%, #20c997 100%);
  color: white;
}

.message-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.message-status.sent {
  color: white;
}

.sent-icon {
  color: white;
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
}

.message-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  white-space: nowrap;
}

.sent-message-content {
  padding: 16px 20px;
  background: var(--free-card-background);
  color: var(--free-text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.message-text {
  font-size: 15px;
  line-height: 1.4;
  color: var(--free-text-color);
  cursor: pointer;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  position: relative;
  transition: color 0.3s ease;
}

.message-text:hover {
  color: var(--free-primary-color);
}

.expand-btn {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--free-primary-color);
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.expand-btn:hover {
  background-color: rgba(225, 0, 15, 0.1);
  transform: translateY(-50%) scale(1.1);
}

.expand-btn svg {
  width: 16px;
  height: 16px;
}

/* Pagination */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px 0;
  border-top: 1px solid var(--free-border-color);
}

.pagination-info {
  font-size: 14px;
  color: var(--free-text-color-secondary);
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
  width: 36px;
  height: 36px;
  border: 1px solid var(--free-border-color);
  background-color: var(--free-card-background);
  color: var(--free-text-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--free-primary-color);
  color: white;
  border-color: var(--free-primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 16px;
  height: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: var(--free-card-background);
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px var(--free-shadow);
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
  font-size: 1.2rem;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--free-text-color-secondary);
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  color: var(--free-primary-color);
  background-color: rgba(225, 0, 15, 0.1);
}

.modal-content {
  padding: 24px;
}

.modal-message {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--free-text-color);
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.modal-info {
  text-align: right;
  border-top: 1px solid var(--free-border-color);
  padding-top: 15px;
}

.modal-date {
  font-size: 12px;
  color: var(--free-text-color-secondary);
  font-weight: 500;
}

/* Status colors */
.status-pending .message-status {
  color: var(--free-warning-color);
}

.status-sent .message-status {
  color: var(--free-success-color);
}

.status-failed .message-status {
  color: var(--free-error-color);
}

.status-cancelled .message-status {
  color: var(--free-text-color-secondary);
}

/* Mobile Responsive - Enhanced for all screen sizes */

/* Very small mobile devices (≤360px) */
@media (max-width: 360px) {
  .history-container {
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
    min-height: auto;
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

  .filter-section {
    margin-bottom: 15px;
  }

  .filter-controls {
    flex-direction: row;
    gap: 10px;
    align-items: flex-end;
  }

  .filter-group {
    flex: 1;
  }

  .filter-group label {
    font-size: 14px;
    margin-bottom: 6px;
  }

  .form-control {
    padding: 10px 12px;
    font-size: 16px; /* Prevents zoom on iOS */
    border-radius: 6px;
    min-height: 44px;
    box-sizing: border-box;
  }

  .btn-refresh {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 6px;
    min-height: 44px;
    margin-bottom: 0;
  }

  .sent-message-list {
    gap: 10px;
  }

  .sent-message-card {
    border-radius: 6px;
    font-size: 13px;
    padding: 0;
  }

  .sent-message-header {
    padding: 12px 16px;
    flex-wrap: nowrap;
  }

  .message-status {
    font-size: 12px;
    gap: 4px;
  }

  .message-status svg {
    width: 14px;
    height: 14px;
  }

  .message-date {
    font-size: 11px;
  }

  .sent-message-content {
    padding: 12px 16px;
  }

  .message-text {
    font-size: 14px;
    line-height: 1.4;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .pagination-btn {
    width: 40px;
    height: 40px;
  }

  .modal-container {
    margin: 10px;
    max-height: 90vh;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-content {
    padding: 20px;
  }

  .modal-message {
    font-size: 14px;
  }
}

/* Small mobile devices (361px - 480px) */
@media (max-width: 480px) and (min-width: 361px) {
  .history-container {
    padding: 16px 12px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .card {
    padding: 16px;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .form-control {
    min-height: 44px;
    font-size: 16px; /* Prevents zoom */
  }

  .btn-refresh {
    width: 44px;
    height: 44px;
  }

  .sent-message-header {
    padding: 14px 18px;
  }

  .sent-message-content {
    padding: 14px 18px;
  }
}

/* Medium mobile devices and tablets (481px - 767px) */
@media (max-width: 767px) and (min-width: 481px) {
  .pagination-controls {
    justify-content: space-between;
    gap: 15px;
  }

  .pagination-btn {
    width: 40px;
    height: 40px;
  }
}

/* Touch-friendly elements */
@media (max-width: 768px) {
  .form-control,
  .btn-refresh,
  .pagination-btn,
  .action-btn {
    min-height: 44px;
  }

  .modal-close-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
</style> 