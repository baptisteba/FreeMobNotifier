<template>
  <div v-if="message" class="edit-modal-overlay" @click.self="onCancel">
    <div class="edit-modal-container">
      <div class="edit-modal-header">
        <h3>Modifier le message programmé</h3>
        <button class="edit-modal-close" @click="onCancel" aria-label="Fermer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="edit-modal-body">
        <div class="form-group">
          <label for="edit-content">Message</label>
          <textarea
            id="edit-content"
            v-model="form.content"
            rows="4"
            maxlength="320"
            class="form-control"
            :class="{'is-invalid': overLimit}"
          ></textarea>
          <div class="char-counter" :class="{'over-limit': overLimit}">
            {{ sanitized.length }}/160
            <span v-if="form.content.length !== sanitized.length" class="char-raw">
              (saisi : {{ form.content.length }})
            </span>
          </div>
          <p v-if="overLimit" class="form-error">
            Le message dépasse 160 caractères après conversion ASCII.
          </p>
          <p v-else-if="sanitizedDiffers" class="sanitize-preview">
            Envoi : <em>{{ sanitized }}</em>
          </p>
        </div>

        <div v-if="form.recurrence === 'none'" class="form-group">
          <label for="edit-sendat">Date d'envoi</label>
          <input
            id="edit-sendat"
            v-model="form.sendAt"
            type="datetime-local"
            class="form-control"
            :min="minDateTime"
          />
        </div>

        <template v-else>
          <div class="form-row">
            <div class="form-group">
              <label for="edit-hour">Heure</label>
              <input
                id="edit-hour"
                v-model.number="form.hour"
                type="number"
                min="0"
                max="23"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label for="edit-minute">Minute</label>
              <input
                id="edit-minute"
                v-model.number="form.minute"
                type="number"
                min="0"
                max="59"
                class="form-control"
              />
            </div>
          </div>

          <div v-if="form.recurrence === 'weekly'" class="form-group">
            <label>Jours</label>
            <div class="day-buttons">
              <button
                v-for="(short, idx) in weekdayShort"
                :key="idx"
                type="button"
                class="day-btn"
                :class="{ active: form.daysOfWeek.includes(idx) }"
                :aria-label="weekdayFull[idx]"
                :title="weekdayFull[idx]"
                @click="toggleDay(idx)"
              >
                {{ short }}
              </button>
            </div>
          </div>

          <div v-if="form.recurrence === 'monthly'" class="form-group">
            <label for="edit-day-of-month">Jour du mois</label>
            <input
              id="edit-day-of-month"
              v-model.number="form.dayOfMonth"
              type="number"
              min="1"
              max="31"
              class="form-control"
            />
          </div>

          <p class="tz-note">Fuseau horaire : {{ form.timezone }}</p>
        </template>

        <p v-if="error" class="form-error">{{ error }}</p>
      </div>

      <div class="edit-modal-footer">
        <button class="btn btn-secondary" @click="onCancel" :disabled="saving">Annuler</button>
        <button class="btn btn-primary" @click="onSave" :disabled="saving || !isValid">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { sanitizeMessage, MAX_SMS_LENGTH } from '../utils/sanitize.js';

const weekdayShort = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
const weekdayFull = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const toLocalInputValue = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default {
  name: 'EditMessageModal',
  props: {
    message: { type: Object, default: null }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const form = ref({
      content: '',
      recurrence: 'none',
      sendAt: '',
      hour: 9,
      minute: 0,
      daysOfWeek: [],
      dayOfMonth: 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    const saving = ref(false);
    const error = ref('');

    const minDateTime = toLocalInputValue(new Date());

    const resetFrom = (msg) => {
      if (!msg) return;
      const cfg = msg.recurrenceConfig || {};
      form.value = {
        content: msg.content || '',
        recurrence: msg.recurrence || 'none',
        sendAt: msg.sendAt ? toLocalInputValue(msg.sendAt) : '',
        hour: cfg.hour ?? 9,
        minute: cfg.minute ?? 0,
        daysOfWeek: Array.isArray(cfg.daysOfWeek) ? [...cfg.daysOfWeek] : [],
        dayOfMonth: cfg.dayOfMonth ?? new Date().getDate(),
        timezone: cfg.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      error.value = '';
    };

    watch(() => props.message, resetFrom, { immediate: true });

    const toggleDay = (idx) => {
      const set = new Set(form.value.daysOfWeek);
      if (set.has(idx)) set.delete(idx); else set.add(idx);
      form.value.daysOfWeek = [...set].sort();
    };

    const sanitized = computed(() => sanitizeMessage(form.value.content));
    const sanitizedDiffers = computed(() =>
      form.value.content.trim() !== '' && sanitized.value !== form.value.content
    );
    const overLimit = computed(() => sanitized.value.length > MAX_SMS_LENGTH);

    const isValid = computed(() => {
      if (!form.value.content.trim()) return false;
      if (overLimit.value) return false;
      if (form.value.recurrence === 'none') {
        if (!form.value.sendAt) return false;
        if (new Date(form.value.sendAt) <= new Date()) return false;
        return true;
      }
      if (form.value.recurrence === 'weekly' && form.value.daysOfWeek.length === 0) return false;
      if (form.value.recurrence === 'monthly' && (form.value.dayOfMonth < 1 || form.value.dayOfMonth > 31)) return false;
      return true;
    });

    const onCancel = () => emit('close');

    const onSave = async () => {
      error.value = '';
      if (!isValid.value) {
        error.value = 'Formulaire incomplet';
        return;
      }
      saving.value = true;
      try {
        const payload = {
          content: form.value.content.trim(),
          recurrence: form.value.recurrence
        };
        if (form.value.recurrence === 'none') {
          payload.sendAt = new Date(form.value.sendAt).toISOString();
          payload.recurrenceConfig = {};
        } else {
          const cfg = {
            hour: form.value.hour,
            minute: form.value.minute,
            timezone: form.value.timezone
          };
          if (form.value.recurrence === 'weekly') cfg.daysOfWeek = form.value.daysOfWeek;
          if (form.value.recurrence === 'monthly') cfg.dayOfMonth = form.value.dayOfMonth;
          payload.recurrenceConfig = cfg;
          payload.sendAt = null;
        }

        await axios.put(`/api/messages/${props.message._id}`, payload);
        emit('saved');
      } catch (err) {
        error.value = err.response?.data?.error || 'Erreur lors de la modification';
      } finally {
        saving.value = false;
      }
    };

    return {
      form,
      saving,
      error,
      isValid,
      sanitized,
      sanitizedDiffers,
      overLimit,
      minDateTime,
      weekdayShort,
      weekdayFull,
      toggleDay,
      onCancel,
      onSave
    };
  }
};
</script>

<style scoped>
.edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.edit-modal-container {
  background: var(--free-card-background);
  color: var(--free-text-color);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px var(--free-shadow);
}

.edit-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--free-border-color);
}

.edit-modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.edit-modal-close {
  background: transparent;
  border: none;
  color: var(--free-text-color-secondary);
  cursor: pointer;
  padding: 4px;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.edit-modal-body {
  padding: 20px;
}

.edit-modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--free-border-color);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: var(--free-text-color-secondary);
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.char-counter {
  text-align: right;
  font-size: 0.75rem;
  color: var(--free-text-color-secondary);
  margin-top: 4px;
}

.char-counter.over-limit {
  color: var(--free-error-color);
  font-weight: 600;
}

.char-raw {
  font-weight: 400;
  margin-left: 4px;
  color: var(--free-text-color-secondary);
}

.sanitize-preview {
  font-size: 0.8rem;
  color: var(--free-text-color-secondary);
  margin: 4px 0 0;
  padding: 6px 10px;
  background: var(--free-background-color);
  border-radius: 6px;
  border: 1px dashed var(--free-border-color);
  overflow-wrap: anywhere;
}

.day-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.day-btn {
  min-width: 44px;
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid var(--free-border-color);
  background: var(--free-card-background);
  color: var(--free-text-color);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-btn.active {
  background: var(--free-primary-color);
  color: #fff;
  border-color: var(--free-primary-color);
}

.tz-note {
  font-size: 0.8rem;
  color: var(--free-text-color-secondary);
  margin-top: 4px;
}

.form-error {
  color: var(--free-error-color);
  font-size: 0.9rem;
  margin-top: 8px;
}

@media (max-width: 480px) {
  .edit-modal-container {
    box-shadow: 0 4px 12px var(--free-shadow);
  }
  .edit-modal-footer {
    flex-direction: column-reverse;
  }
  .edit-modal-footer .btn {
    width: 100%;
  }
}
</style>
