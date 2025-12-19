<template>
  <div class="free-datetime-picker" :class="{ 'dark-mode': dark }">
    <!-- Separate Date and Time Pickers -->
    <div class="picker-row">
      <!-- Date Picker -->
      <div class="picker-group date-picker-group">
        <label class="picker-label">Date</label>
        <Datepicker
          v-model="dateValue"
          :dark="dark"
          :locale="locale"
          format="dd/MM/yyyy"
          :placeholder="datePlaceholder"
          :enableTimePicker="false"
          :monthChangeOnScroll="monthChangeOnScroll"
          :autoApply="autoApply"
          :clearable="clearable"
          :teleport="teleport"
          :monthNameFormat="monthNameFormat"
          textInput
          class="free-datepicker"
          menuClassName="free-datepicker-menu"
          inputClassName="free-datepicker-input"
          @update:model-value="handleDateChange"
        >
          <template #input-icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="picker-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </template>
        </Datepicker>
      </div>

      <!-- Inline Time Picker -->
      <div class="picker-group time-picker-group">
        <label class="picker-label">Heure (24h)</label>
        <div class="inline-time-picker">
          <!-- Hours -->
          <div class="time-column">
            <button
              type="button"
              class="time-btn increment"
              @click="incrementHour"
              aria-label="Augmenter les heures"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <input
              type="text"
              class="time-input"
              :value="formatNumber(hours)"
              @input="handleHourInput"
              @blur="validateHour"
              maxlength="2"
              inputmode="numeric"
              pattern="[0-9]*"
              aria-label="Heures"
            />
            <button
              type="button"
              class="time-btn decrement"
              @click="decrementHour"
              aria-label="Diminuer les heures"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <!-- Separator -->
          <div class="time-separator">:</div>

          <!-- Minutes -->
          <div class="time-column">
            <button
              type="button"
              class="time-btn increment"
              @click="incrementMinute"
              aria-label="Augmenter les minutes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <input
              type="text"
              class="time-input"
              :value="formatNumber(minutes)"
              @input="handleMinuteInput"
              @blur="validateMinute"
              maxlength="2"
              inputmode="numeric"
              pattern="[0-9]*"
              aria-label="Minutes"
            />
            <button
              type="button"
              class="time-btn decrement"
              @click="decrementMinute"
              aria-label="Diminuer les minutes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// Props with default values
const props = defineProps({
  modelValue: {
    type: [Date, String, null],
    default: null
  },
  dark: {
    type: Boolean,
    default: false
  },
  locale: {
    type: String,
    default: 'fr-FR'
  },
  datePlaceholder: {
    type: String,
    default: 'Choisir une date'
  },
  timePlaceholder: {
    type: String,
    default: 'Choisir une heure'
  },
  monthChangeOnScroll: {
    type: [Boolean, String],
    default: true
  },
  autoApply: {
    type: Boolean,
    default: true
  },
  clearable: {
    type: Boolean,
    default: true
  },
  teleport: {
    type: [Boolean, String],
    default: false
  },
  monthNameFormat: {
    type: String,
    default: 'long'
  }
});

// Emits
const emit = defineEmits(['update:modelValue']);

// Separate date and time values
const dateValue = ref(null);
const hours = ref(12);
const minutes = ref(0);

// Format number with leading zero
const formatNumber = (num) => {
  return String(num).padStart(2, '0');
};

// Initialize values from modelValue
const initializeValues = () => {
  if (props.modelValue) {
    const date = new Date(props.modelValue);
    if (!isNaN(date.getTime())) {
      dateValue.value = date;
      hours.value = date.getHours();
      minutes.value = date.getMinutes();
    }
  } else {
    dateValue.value = null;
    hours.value = 12;
    minutes.value = 0;
  }
};

// Watch for external changes
watch(() => props.modelValue, () => {
  initializeValues();
}, { immediate: true });

// Combine date and time into a single value
const combineDateTime = () => {
  if (!dateValue.value) {
    emit('update:modelValue', null);
    return;
  }

  const combined = new Date(dateValue.value);
  combined.setHours(hours.value);
  combined.setMinutes(minutes.value);
  combined.setSeconds(0);
  combined.setMilliseconds(0);

  emit('update:modelValue', combined);
};

// Handle date changes
const handleDateChange = (value) => {
  dateValue.value = value;
  combineDateTime();
};

// Hour controls
const incrementHour = () => {
  hours.value = (hours.value + 1) % 24;
  combineDateTime();
};

const decrementHour = () => {
  hours.value = (hours.value - 1 + 24) % 24;
  combineDateTime();
};

const handleHourInput = (event) => {
  const value = event.target.value.replace(/\D/g, '');
  if (value === '') {
    hours.value = 0;
  } else {
    const num = parseInt(value, 10);
    if (num >= 0 && num <= 23) {
      hours.value = num;
    }
  }
  combineDateTime();
};

const validateHour = () => {
  if (hours.value < 0) hours.value = 0;
  if (hours.value > 23) hours.value = 23;
  combineDateTime();
};

// Minute controls
const incrementMinute = () => {
  minutes.value = (minutes.value + 1) % 60;
  combineDateTime();
};

const decrementMinute = () => {
  minutes.value = (minutes.value - 1 + 60) % 60;
  combineDateTime();
};

const handleMinuteInput = (event) => {
  const value = event.target.value.replace(/\D/g, '');
  if (value === '') {
    minutes.value = 0;
  } else {
    const num = parseInt(value, 10);
    if (num >= 0 && num <= 59) {
      minutes.value = num;
    }
  }
  combineDateTime();
};

const validateMinute = () => {
  if (minutes.value < 0) minutes.value = 0;
  if (minutes.value > 59) minutes.value = 59;
  combineDateTime();
};

onMounted(() => {
  initializeValues();
});
</script>

<style>
/* Free Mobile red color */
:root {
  --free-primary-color: #E1000F;
  --free-text-color: #333333;
  --free-border-color: #cccccc;
  --free-hover-color: #f8f8f8;
  --free-active-color: #E1000F15;
}

/* Dark theme support for datepicker */
:root.dark-theme {
  --free-primary-color: #FF1A2D;
  --free-text-color: #e0e0e0;
  --free-border-color: #404040;
  --free-hover-color: #2a2a2a;
  --free-active-color: rgba(255, 26, 45, 0.15);
}

/* Picker container */
.free-datetime-picker {
  width: 100%;
}

.picker-row {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.picker-group {
  width: 100%;
}

.picker-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--free-text-color);
}

.picker-icon {
  color: var(--free-primary-color);
}

/* Datepicker styling */
.free-datepicker {
  width: 100%;
  font-family: 'Arial', sans-serif;
}

/* Custom input styling */
.free-datepicker-input {
  border: 1px solid var(--free-border-color) !important;
  border-radius: 8px !important;
  padding: 12px 14px !important;
  font-size: 16px !important;
  width: 100% !important;
  transition: all 0.2s ease !important;
  color: var(--free-text-color) !important;
  background-color: var(--free-card-background) !important;
  min-height: 48px !important;
  box-sizing: border-box !important;
}

.free-datepicker-input:focus {
  border-color: var(--free-primary-color) !important;
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(225, 0, 15, 0.15) !important;
}

/* Calendar menu styling */
.free-datepicker-menu {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 8px 24px var(--free-shadow) !important;
  background-color: var(--free-card-background) !important;
  border: 1px solid var(--free-border-color) !important;
}

/* Inline Time Picker */
.inline-time-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--free-card-background);
  border: 1px solid var(--free-border-color);
  border-radius: 8px;
  padding: 8px 12px;
  min-height: 48px;
  box-sizing: border-box;
}

.time-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.time-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 28px;
  border: none;
  background-color: var(--free-hover-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--free-text-color);
  padding: 0;
}

.time-btn:hover {
  background-color: var(--free-primary-color);
  color: white;
}

.time-btn:active {
  transform: scale(0.95);
}

.time-btn svg {
  width: 18px;
  height: 18px;
}

.time-input {
  width: 44px;
  height: 44px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 1px solid var(--free-border-color);
  border-radius: 8px;
  background-color: var(--free-background-color);
  color: var(--free-text-color);
  padding: 0;
  transition: all 0.2s ease;
}

.time-input:focus {
  outline: none;
  border-color: var(--free-primary-color);
  box-shadow: 0 0 0 3px rgba(225, 0, 15, 0.15);
}

.time-separator {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--free-text-color);
  padding: 0 4px;
  line-height: 1;
  margin-top: 28px;
}

/* Light theme customization */
.dp__theme_light {
  --dp-primary-color: var(--free-primary-color) !important;
  --dp-icon-color: var(--free-primary-color) !important;
  --dp-border-color-hover: var(--free-primary-color) !important;
  --dp-border-color-focus: var(--free-primary-color) !important;
  --dp-danger-color: var(--free-primary-color) !important;
  --dp-marker-color: var(--free-primary-color) !important;
  --dp-background-color: var(--free-card-background) !important;
  --dp-text-color: var(--free-text-color) !important;
  --dp-hover-color: var(--free-hover-color) !important;
}

/* Dark theme customization */
.dp__theme_dark {
  --dp-primary-color: var(--free-primary-color) !important;
  --dp-icon-color: var(--free-primary-color) !important;
  --dp-border-color-hover: var(--free-primary-color) !important;
  --dp-border-color-focus: var(--free-primary-color) !important;
  --dp-danger-color: var(--free-primary-color) !important;
  --dp-marker-color: var(--free-primary-color) !important;
  --dp-background-color: var(--free-card-background) !important;
  --dp-text-color: var(--free-text-color) !important;
  --dp-hover-color: var(--free-hover-color) !important;
  --dp-hover-text-color: var(--free-text-color) !important;
}

/* Active state styling */
.dp__active_date {
  background-color: var(--free-primary-color) !important;
  color: white !important;
}

/* Hover styling */
.dp__date_hover {
  background-color: var(--free-active-color) !important;
  color: var(--free-text-color) !important;
}

/* Button styling */
.dp__action_button {
  color: var(--free-primary-color) !important;
  font-weight: bold;
}

/* Today marker */
.dp__today {
  border: 1px solid var(--free-primary-color) !important;
}

/* Calendar arrows */
.dp__month_year_row svg {
  fill: var(--free-primary-color) !important;
}

/* Selected range styling */
.dp__range_start, .dp__range_end {
  background-color: var(--free-primary-color) !important;
}

.dp__range_between {
  background-color: var(--free-active-color) !important;
}

/* Dark theme specific overrides */
:root.dark-theme .dp__menu {
  background-color: var(--free-card-background) !important;
  border: 1px solid var(--free-border-color) !important;
}

:root.dark-theme .dp__calendar_header,
:root.dark-theme .dp__calendar_header_item {
  color: var(--free-text-color) !important;
}

:root.dark-theme .dp__cell_inner {
  color: var(--free-text-color) !important;
}

:root.dark-theme .dp__input {
  background-color: var(--free-card-background) !important;
  color: var(--free-text-color) !important;
  border-color: var(--free-border-color) !important;
}

:root.dark-theme .inline-time-picker {
  background-color: var(--free-card-background);
  border-color: var(--free-border-color);
}

:root.dark-theme .time-input {
  background-color: var(--free-background-color);
  border-color: var(--free-border-color);
  color: var(--free-text-color);
}

:root.dark-theme .time-btn {
  background-color: var(--free-hover-color);
  color: var(--free-text-color);
}

:root.dark-theme .time-btn:hover {
  background-color: var(--free-primary-color);
  color: white;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .picker-row {
    gap: 12px;
  }

  .free-datepicker-input {
    font-size: 16px !important;
    padding: 14px 12px !important;
    min-height: 52px !important;
  }

  .picker-label {
    font-size: 0.95rem;
    margin-bottom: 6px;
  }

  .inline-time-picker {
    padding: 12px 16px;
    min-height: 56px;
  }

  .time-input {
    width: 52px;
    height: 52px;
    font-size: 1.6rem;
  }

  .time-btn {
    width: 44px;
    height: 32px;
  }

  .time-btn svg {
    width: 20px;
    height: 20px;
  }

  .time-separator {
    font-size: 2rem;
    margin-top: 32px;
  }
}

/* Tablet */
@media (min-width: 481px) and (max-width: 768px) {
  .picker-row {
    gap: 12px;
  }

  .free-datepicker-input {
    padding: 12px !important;
    min-height: 50px !important;
  }

  .inline-time-picker {
    padding: 10px 14px;
  }

  .time-input {
    width: 48px;
    height: 48px;
    font-size: 1.4rem;
  }
}
</style>
