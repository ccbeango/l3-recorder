import { defineComponent, h } from 'vue'

import { Icon } from '@iconify/vue'

export function createIcon(icon: string) {
  return defineComponent({
    name: `Icon-${icon}`,
    setup(props, { attrs }) {
      return () => h(Icon, { icon, ...props, ...attrs })
    }
  })
}
