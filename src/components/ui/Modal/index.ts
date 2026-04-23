import { cn } from '@/utils/cn';
import { defineComponent, h } from 'vue';

export { 
  DialogRoot as Modal, 
  DialogTrigger as ModalTrigger, 
  DialogClose as ModalClose,
  DialogPortal as ModalPortal,
  DialogTitle as ModalTitle,
  DialogDescription as ModalDescription
} from 'radix-vue';

export { default as ModalContent } from './ModalContent.vue';

export const ModalHeader = defineComponent({
  name: 'ModalHeader',
  props: {
    class: { type: String, default: '' }
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: cn('flex flex-col space-y-1.5 text-center sm:text-left', props.class)
    }, slots.default?.());
  }
});

export const ModalFooter = defineComponent({
  name: 'ModalFooter',
  props: {
    class: { type: String, default: '' }
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', props.class)
    }, slots.default?.());
  }
});
