<script setup lang="ts">
import type { TabsContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '@shadcn/utils';
import { TabsContent } from 'reka-ui';

interface Props extends TabsContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <TabsContent
    data-slot="tabs-content"
    :class="
      cn(
        'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        props.class,
      )
    "
    v-bind="props"
  >
    <slot />
  </TabsContent>
</template>
