<script setup lang="ts">
import type { TaoButtonProps } from './types';

import { LoaderCircle } from '@icons';
import { cn } from '@shadcn/utils';
import { Primitive } from 'reka-ui';
import { computed } from 'vue';

import { buttonVariants } from '../../ui';

interface Props extends TaoButtonProps {}

const {
  as = 'button',
  class: className = '',
  disabled = false,
  loading = false,
  size = 'default',
  variant = 'default',
} = defineProps<Props>();

const isDisabled = computed(() => {
  return disabled || loading;
});
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), className)"
    :disabled="isDisabled"
  >
    <LoaderCircle
      v-if="loading"
      class="text-md mr-1 size-4 shrink-0 animate-spin"
    />
    <slot></slot>
  </Primitive>
</template>
