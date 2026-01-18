<script setup lang="ts">
import type { BadgeVariants } from '.';
import type { HTMLAttributes } from 'vue';

import { cn } from '@shadcn/utils';
import { computed } from 'vue';

import { badgeVariants } from '.';

interface Props {
  variant?: BadgeVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <div
    :class="cn(badgeVariants({ variant }), props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </div>
</template>
