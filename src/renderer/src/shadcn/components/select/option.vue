<script setup lang="ts">
import { SelectItem } from '../../ui/select';

defineProps<{
  value: string;
  disabled?: boolean;
}>();
</script>

<template>
  <SelectItem :value="value" :disabled="disabled">
    <slot />
  </SelectItem>
</template>
