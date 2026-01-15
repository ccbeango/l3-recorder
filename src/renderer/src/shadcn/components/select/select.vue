<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { useVModel } from '@vueuse/core';

interface Option {
  label: string;
  value: string;
}

const props = defineProps<{
  modelValue?: string;
  defaultValue?: string;
  placeholder?: string;
  options?: Option[];
  disabled?: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <Select v-model="modelValue" :disabled="disabled">
    <SelectTrigger>
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <slot>
        <template v-if="options">
          <SelectItem
            v-for="opt in options"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </SelectItem>
        </template>
      </slot>
    </SelectContent>
  </Select>
</template>
