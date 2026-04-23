import { cn } from '@/utils/cn';
import { defineComponent, h } from 'vue';

export { 
  DialogRoot as Drawer, 
  DialogTrigger as DrawerTrigger, 
  DialogClose as DrawerClose,
  DialogPortal as DrawerPortal,
  DialogTitle as DrawerTitle,
  DialogDescription as DrawerDescription
} from 'radix-vue';

export { default as DrawerContent } from './DrawerContent.vue';

export const DrawerHeader = defineComponent({
  name: 'DrawerHeader',
  props: {
    class: { type: String, default: '' }
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: cn('flex flex-col space-y-2 border-b border-gray-100 px-6 py-5 shrink-0', props.class)
    }, slots.default?.());
  }
});

export const DrawerFooter = defineComponent({
  name: 'DrawerFooter',
  props: {
    class: { type: String, default: '' }
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: cn('flex items-center justify-end space-x-3 border-t border-gray-100 px-6 py-4 shrink-0 bg-gray-50/50', props.class)
    }, slots.default?.());
  }
});
