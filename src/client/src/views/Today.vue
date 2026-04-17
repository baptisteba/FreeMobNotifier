<template>
  <div class="today-container">
    <h1 class="page-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="page-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      Aujourd'hui
      <span class="date-hint">{{ todayLabel }}</span>
    </h1>

    <div class="card today-card">
      <h2 class="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        À venir
        <span class="count-badge">{{ upcoming.length }}</span>
      </h2>

      <div v-if="isLoading" class="loading">
        <span>Chargement...</span>
      </div>

      <div v-else-if="upcoming.length === 0 && past.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>Aucun rappel aujourd'hui</p>
        <router-link to="/" class="btn btn-primary">Programmer un message</router-link>
      </div>

      <div v-else>
        <ul v-if="upcoming.length > 0" class="today-list">
          <li v-for="entry in upcoming" :key="entry.message._id + '-u'" class="today-item upcoming">
            <div class="time-col">
              <span class="fire-time">{{ formatTime(entry.fireAt) }}</span>
              <span class="fire-relative">{{ relative(entry.fireAt) }}</span>
            </div>
            <div class="body-col">
              <p class="content">{{ entry.message.content }}</p>
              <p class="meta">{{ formatRecurrenceShort(entry.message) }}</p>
            </div>
          </li>
        </ul>

        <div v-if="past.length > 0" class="past-section">
          <h3 class="section-subtitle">Déjà écoulés aujourd'hui</h3>
          <ul class="today-list past-list">
            <li v-for="entry in past" :key="entry.message._id + '-p'" class="today-item past">
              <div class="time-col">
                <span class="fire-time">{{ formatTime(entry.fireAt) }}</span>
                <span class="fire-relative">{{ relative(entry.fireAt) }}</span>
              </div>
              <div class="body-col">
                <p class="content">{{ entry.message.content }}</p>
                <p class="meta">{{ formatRecurrenceShort(entry.message) }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card today-card">
      <h2 class="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Récemment envoyés
      </h2>

      <ul v-if="recentSent.length > 0" class="recent-list">
        <li v-for="msg in recentSent" :key="msg._id" class="recent-item">
          <span class="recent-time">{{ formatTime(msg.lastSent) }}</span>
          <span class="recent-content">{{ msg.content }}</span>
        </li>
      </ul>
      <p v-else class="empty-recent">Aucun envoi récent</p>
    </div>

    <div class="quick-actions">
      <router-link to="/" class="btn btn-primary">Nouveau message</router-link>
      <router-link to="/scheduled" class="btn btn-secondary">Tous les messages programmés</router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { resolveToday, formatRelative } from '../composables/useResolveToday.js';

export default {
  name: 'Today',
  setup() {
    const messages = ref([]);
    const isLoading = ref(true);
    const nowTick = ref(new Date());

    const todayLabel = computed(() =>
      new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
        .format(nowTick.value)
    );

    const resolved = computed(() => resolveToday(messages.value, nowTick.value));
    const upcoming = computed(() => resolved.value.filter((e) => e.status === 'upcoming'));
    const past = computed(() => resolved.value.filter((e) => e.status === 'past'));

    const recentSent = computed(() =>
      [...messages.value]
        .filter((m) => m.status === 'sent' && m.lastSent)
        .sort((a, b) => new Date(b.lastSent) - new Date(a.lastSent))
        .slice(0, 5)
    );

    const formatTime = (d) =>
      d ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : '';

    const relative = (d) => formatRelative(new Date(d), nowTick.value);

    const formatRecurrenceShort = (msg) => {
      if (!msg.recurrence || msg.recurrence === 'none') return 'Ponctuel';
      const cfg = msg.recurrenceConfig || {};
      if (msg.recurrence === 'daily') return 'Quotidien';
      if (msg.recurrence === 'weekly') {
        const days = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
        const picked = (cfg.daysOfWeek || []).map((d) => days[d]).join(', ');
        return `Hebdo (${picked})`;
      }
      if (msg.recurrence === 'monthly') return `Mensuel (jour ${cfg.dayOfMonth})`;
      return msg.recurrence;
    };

    const fetchMessages = async () => {
      isLoading.value = true;
      messages.value = [];
      try {
        const res = await axios.get('/api/messages');
        messages.value = res.data || [];
      } catch (err) {
        console.error('Error loading messages', err);
      } finally {
        isLoading.value = false;
      }
    };

    let tickInterval;
    onMounted(() => {
      fetchMessages();
      tickInterval = setInterval(() => {
        nowTick.value = new Date();
      }, 30000);
    });

    return {
      isLoading,
      todayLabel,
      upcoming,
      past,
      recentSent,
      formatTime,
      relative,
      formatRecurrenceShort
    };
  }
};
</script>

<style scoped>
.today-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 15px;
  color: var(--free-text-color);
  background-color: var(--free-background-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.4rem;
  margin-bottom: 16px;
  color: var(--free-text-color);
  flex-wrap: wrap;
  transition: color 0.3s ease;
}

.page-icon {
  color: var(--free-primary-color);
}

.date-hint {
  font-size: 0.9rem;
  color: var(--free-text-color-secondary);
  font-weight: 400;
  margin-left: 4px;
  text-transform: capitalize;
}

.today-card {
  margin-bottom: 16px;
  background-color: var(--free-card-background);
  color: var(--free-text-color);
  border: 1px solid var(--free-border-color);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  margin: 0 0 16px;
  color: var(--free-text-color);
}

.card-icon {
  color: var(--free-primary-color);
}

.count-badge {
  background: var(--free-primary-color);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

.today-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.today-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-bottom: 1px solid var(--free-border-color);
  align-items: flex-start;
}

.today-item:last-child {
  border-bottom: none;
}

.time-col {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}

.fire-time {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--free-primary-color);
}

.fire-relative {
  font-size: 0.75rem;
  color: var(--free-text-color-secondary);
}

.body-col {
  flex: 1;
  min-width: 0;
}

.content {
  margin: 0;
  color: var(--free-text-color);
  overflow-wrap: anywhere;
}

.meta {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: var(--free-text-color-secondary);
}

.today-item.past {
  opacity: 0.6;
}

.section-subtitle {
  font-size: 0.9rem;
  color: var(--free-text-color-secondary);
  margin: 16px 0 8px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 24px 16px;
  color: var(--free-text-color-secondary);
}

.empty-state svg {
  opacity: 0.5;
  margin-bottom: 12px;
}

.empty-state .btn {
  margin-top: 12px;
}

.loading {
  text-align: center;
  padding: 24px;
  color: var(--free-text-color-secondary);
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--free-border-color);
  align-items: baseline;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-time {
  min-width: 60px;
  font-weight: 600;
  color: var(--free-text-color-secondary);
  font-size: 0.9rem;
}

.recent-content {
  flex: 1;
  color: var(--free-text-color);
  overflow-wrap: anywhere;
}

.empty-recent {
  color: var(--free-text-color-secondary);
  text-align: center;
  margin: 8px 0;
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.quick-actions .btn {
  flex: 1;
  min-width: 140px;
  text-align: center;
}

@media (max-width: 360px) {
  .today-item {
    flex-direction: column;
    gap: 4px;
  }
  .time-col {
    flex-direction: row;
    gap: 8px;
    align-items: baseline;
    min-width: 0;
  }
}
</style>
