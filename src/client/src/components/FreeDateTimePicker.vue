<template>
  <Datepicker
    v-model="dateModelValue"
    :dark="dark"
    :locale="locale"
    :format="format"
    :placeholder="placeholder"
    :is24="is24"
    :enableTimePicker="enableTimePicker"
    :monthChangeOnScroll="monthChangeOnScroll"
    :autoApply="autoApply"
    :clearable="clearable"
    :teleport="teleport"
    :inline="inline"
    :monthNameFormat="monthNameFormat"
    textInput
    class="free-datepicker"
    menuClassName="free-datepicker-menu"
    :inputClassName="inputClassName"
    @update:model-value="handleDateChange"
  >
    <template v-if="$slots.trigger" #trigger>
      <slot name="trigger"></slot>
    </template>
    <template v-if="$slots.action-buttons" #action-buttons>
      <slot name="action-buttons"></slot>
    </template>
    <template v-if="$slots.inputIcon" #inputIcon>
      <slot name="inputIcon"></slot>
    </template>
  </Datepicker>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
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
  format: {
    type: [String, Function],
    default: 'dd/MM/yyyy HH:mm'
  },
  placeholder: {
    type: String,
    default: 'Sélectionnez une date'
  },
  is24: {
    type: Boolean,
    default: true
  },
  enableTimePicker: {
    type: Boolean,
    default: true
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
  inline: {
    type: Boolean,
    default: false
  },
  monthNameFormat: {
    type: String,
    default: 'long'
  },
  inputClassName: {
    type: String,
    default: 'free-datepicker-input'
  }
});

// Emits
const emit = defineEmits(['update:modelValue']);

// Setup local date model
const dateModelValue = ref(props.modelValue);

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  dateModelValue.value = newValue;
}, { immediate: true });

// Handle date changes
const handleDateChange = (value) => {
  emit('update:modelValue', value);
};
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

/* Datepicker styling */
.free-datepicker {
  width: 100%;
  font-family: 'Arial', sans-serif;
}

/* Custom input styling */
.free-datepicker-input {
  border: 1px solid var(--free-border-color);
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease;
  color: var(--free-text-color);
}

.free-datepicker-input:focus {
  border-color: var(--free-primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(225, 0, 15, 0.2);
}

/* Calendar menu styling */
.free-datepicker-menu {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Customize the primary color for all datepicker elements */
.dp__theme_light {
  --dp-primary-color: var(--free-primary-color) !important;
  --dp-icon-color: var(--free-primary-color) !important;
  --dp-border-color-hover: var(--free-primary-color) !important;
  --dp-border-color-focus: var(--free-primary-color) !important;
  --dp-danger-color: var(--free-primary-color) !important;
  --dp-marker-color: var(--free-primary-color) !important;
}

/* Active state styling */
.dp__active_date {
  background-color: var(--free-primary-color) !important;
  color: white !important;
}

/* Hover styling */
.dp__date_hover {
  background-color: var(--free-active-color) !important;
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
</style> 