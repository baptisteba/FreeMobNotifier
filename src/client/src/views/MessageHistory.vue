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
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
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
  padding: 8px 15px;
  background-color: #f8f9fa;
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

.detail-label {
  flex: 0 0 120px;
  font-weight: 600;
  color: #666;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 0;
}

.sent-message-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.sent-message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.sent-message-content {
  padding: 20px;
  background: white;
}

.message-text {
  font-size: 16px;
  line-height: 1.5;
  color: #333;
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

.expand-btn svg {
  width: 16px;
  height: 16px;
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

  /* Message list optimizations */
  .message-list {
    gap: 10px;
    max-height: none;
  }

  .message-item {
    border-radius: 6px;
  }

  .message-header {
    padding: 8px 12px;
    flex-wrap: wrap;
    height: auto;
    min-height: 44px;
  }

  .message-status {
    font-size: 13px;
    gap: 6px;
  }

  .message-status svg {
    width: 14px;
    height: 14px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    border-radius: 6px;
  }

  .message-content {
    padding: 10px 12px;
    font-size: 14px;
    max-height: 80px;
  }

  .message-details {
    padding: 8px 12px;
    margin-top: 6px;
  }

  .detail-row.inline {
    gap: 4px;
    font-size: 11px;
    justify-content: flex-start;
  }

  .detail-icon {
    width: 12px;
    height: 12px;
  }

  .detail-value.compact {
    font-size: 11px;
    font-weight: 600;
  }

  /* Card optimizations for very small screens */
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
    color: white;
  }

  .message-text {
    padding: 8px 10px;
    border-radius: 4px;
    font-size: 13px;
    min-height: 44px;
    line-height: 1.3;
  }

  .expand-btn {
    width: 32px;
    height: 32px;
    margin-left: 4px;
  }

  .expand-btn svg {
    width: 12px;
    height: 12px;
  }

  /* Pagination optimizations */
  .pagination-controls {
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
    gap: 12px;
    height: auto;
    align-items: center;
  }

  .pagination-info {
    margin-right: 0;
    font-size: 12px;
  }

  .pagination-buttons {
    gap: 6px;
  }

  .pagination-btn {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    border-radius: 6px;
  }

  /* Modal optimizations */
  .modal-container {
    width: 98%;
    margin: 4px;
    max-height: 92vh;
    border-radius: 8px;
  }

  .modal-header {
    padding: 12px 15px;
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .modal-content {
    padding: 15px;
  }

  .modal-message {
    font-size: 14px;
    line-height: 1.4;
  }
}

/* Small mobile devices (361px - 480px) */
@media (max-width: 480px) and (min-width: 361px) {
  .history-container {
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

  .filter-controls {
    flex-direction: row;
    gap: 12px;
    align-items: flex-end;
  }
  
  .filter-group {
    flex: 1;
  }

  .form-control {
    min-height: 44px;
    box-sizing: border-box;
  }

  .btn-refresh {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    min-height: 44px;
    margin-bottom: 0;
  }

  .sent-message-card {
    padding: 0;
    border-radius: 8px;
  }

  .sent-message-header {
    padding: 14px 18px;
    flex-wrap: nowrap;
  }

  .message-text {
    min-height: 44px;
    font-size: 14px;
  }

  .message-details {
    padding: 8px 15px;
    margin-top: 8px;
  }

  .detail-row.inline {
    gap: 5px;
    font-size: 12px;
  }

  .detail-icon {
    width: 13px;
    height: 13px;
  }

  .detail-value.compact {
    font-size: 12px;
  }

  .pagination-btn {
    width: 36px;
    height: 36px;
  }
}

/* Medium mobile devices and tablets (481px - 767px) */
@media (max-width: 767px) and (min-width: 481px) {
  .filter-controls {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }

  .filter-group {
    flex: 1;
    min-width: 200px;
  }

  .btn-refresh {
    flex-shrink: 0;
  }
}

/* Existing medium screen optimizations (≤900px) */
@media (max-width: 900px) {
  .filter-controls {
    flex-direction: row;
    gap: 10px;
    align-items: flex-end;
  }
  
  .filter-group {
    flex: 1;
    max-width: none;
  }
  
  .btn-refresh {
    flex-shrink: 0;
  }
  
  .detail-row {
    flex-direction: column;
  }
  
  .detail-label {
    margin-bottom: 4px;
  }
  
  .sent-messages-container {
    border-radius: 6px;
  }
  
  .sent-message-card {
    position: relative;
  }
  
  .sent-message-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
  }
  
  .message-status {
    font-size: 13px;
  }
  
  .message-date {
    font-size: 12px;
  }
  
  .message-text {
    padding: 10px;
    font-size: 13px;
  }
  
  .pagination-controls {
    flex-direction: row;
    justify-content: space-between;
    padding: 15px;
    height: auto;
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

/* Existing small screen optimizations (≤500px) */
@media (max-width: 500px) {
  .card {
    padding: 15px;
  }
  
  .sent-message-card {
    padding: 0;
  }
  
  .sent-message-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
  }
  
  .message-status {
    font-size: 12px;
  }
  
  .message-date {
    font-size: 11px;
    margin-top: 2px;
  }
  
  .message-text {
    padding: 10px;
    font-size: 13px;
    min-height: 50px;
  }
  
  .pagination-controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: auto;
    min-height: 60px;
    gap: 8px;
    padding: 15px;
  }
  
  .pagination-info {
    margin-right: 0;
    font-size: 12px;
  }
}

/* Enhanced loading and empty states for mobile */
@media (max-width: 768px) {
  .loading, .empty-state {
    padding: 30px 15px;
    min-height: 200px;
  }

  .loading .spinner,
  .empty-state svg {
    width: 40px;
    height: 40px;
  }

  .empty-state p {
    font-size: 14px;
    margin-top: 10px;
  }
}

/* Touch-friendly interactive elements */
@media (max-width: 768px) {
  .expand-btn,
  .pagination-btn,
  .btn-refresh {
    min-height: 44px;
    min-width: 44px;
  }

  .message-text {
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  /* Improve tap targets */
  .nav-item,
  .form-control,
  select.form-control {
    min-height: 44px;
  }
}

/* Improve modal responsiveness */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 85vh;
    margin: 20px;
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
  
  .modal-close-btn {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
  }
}

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

:global(body.modal-open) {
  overflow: hidden;
}
</style> 