<script setup lang="ts">
import type { TabsListProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '@shadcn/utils';
import { TabsList } from 'reka-ui';

interface Props extends TabsListProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    :class="
      cn(
        'bg-muted text-muted-foreground inline-flex h-auto items-center justify-center gap-1 rounded-md p-1',
        props.class,
      )
    "
    v-bind="props"
  >
    <slot />
  </TabsList>
</template>
