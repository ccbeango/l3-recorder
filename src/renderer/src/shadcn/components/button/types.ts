import type { ButtonVariants } from '../..';
import type { AsTag } from 'reka-ui';
import type { Component } from 'vue';

export interface TaoButtonProps {
  /**
   * 该元素或组件应渲染为何种元素/组件。可通过 asChild 属性覆盖。
   * @defaultValue "div"
   */
  as?: AsTag | Component;
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   * Read our Composition[https://reka-ui.com/docs/guides/composition] guide for more details.
   */
  asChild?: boolean;
  class?: any;
  disabled?: boolean;
  loading?: boolean;
  size?: ButtonVariants['size'];
  variant?: ButtonVariants['variant'];
}
