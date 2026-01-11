<script setup lang="ts">
import type { TaoButtonProps } from './types';
import type { TooltipContentProps } from 'reka-ui';

import { cn } from '@shadcn/utils';
import { computed, useSlots } from 'vue';

import { L3Button } from '.';
import { L3Tooltip } from '../tooltip';

interface Props extends TaoButtonProps {
  rounded?: boolean;
  tooltip?: string;
  tooltipDelayDuration?: number;
  tooltipSide?: TooltipContentProps['side'];
}

const {
  class: className,
  disabled = false,
  rounded = false,
  size = 'icon',
  tooltip,
  tooltipDelayDuration = 200,
  tooltipSide = 'top',
  variant = 'ghost',
} = defineProps<Props>();

const slots = useSlots();

const showTooltip = computed(() => !!slots.tooltip || !!tooltip);
</script>

<template>
  <L3Button
    v-if="!showTooltip"
    :class="cn({ 'rounded-full': rounded }, 'cursor-pointer', className)"
    :variant="variant"
    :disabled="disabled"
    :size="size"
  >
    <slot></slot>
  </L3Button>
  <L3Tooltip v-else :delay-duration="tooltipDelayDuration" :side="tooltipSide">
    <template #trigger>
      <L3Button
        :class="cn({ 'rounded-full': rounded }, className)"
        :disabled="disabled"
        :variant="variant"
        :size="size"
      >
        <slot></slot>
      </L3Button>
    </template>
    <slot v-if="slots.tooltip" name="tooltip"></slot>
    <template v-else>
      {{ tooltip }}
    </template>
  </L3Tooltip>
</template>
