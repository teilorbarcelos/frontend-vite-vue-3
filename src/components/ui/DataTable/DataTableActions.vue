<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Component } from 'vue';
import { Edit2, Trash2, MoreHorizontal } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../DropdownMenu';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle
} from '../Modal';

interface Props {
  id: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  deleteMessage?: string;
  extraActions?: {
    label: string;
    icon?: Component;
    onClick: (id: string) => void;
    className?: string;
  }[];
}

const props = withDefaults(defineProps<Props>(), {
  deleteMessage: 'Tem certeza que deseja excluir este registro?',
  extraActions: () => []
});

const isDeleteDialogOpen = ref(false);

const handleDelete = (): void => {
  isDeleteDialogOpen.value = false;
  props.onDelete?.(props.id);
};

const actions = computed(() => {
  const result = [];

  if (props.onEdit) {
    result.push({
      label: 'Editar',
      icon: Edit2,
      onClick: () => props.onEdit?.(props.id)
    });
  }

  if (props.onDelete) {
    result.push({
      label: 'Excluir',
      icon: Trash2,
      onClick: () => (isDeleteDialogOpen.value = true),
      className: 'text-red-600 focus:text-red-600 focus:bg-red-50'
    });
  }

  props.extraActions.forEach((a) => {
    result.push({
      label: a.label,
      icon: a.icon,
      onClick: () => a.onClick(props.id),
      className: a.className
    });
  });

  return result;
});
</script>

<template>
  <div class="flex justify-end">
    <template v-if="actions.length === 1">
      <Button
        variant="ghost"
        size="sm"
        @click="actions[0].onClick"
        :class="actions[0].className"
        :title="actions[0].label"
      >
        <component :is="actions[0].icon" class="w-4 h-4 mr-2" />
      </Button>
    </template>
    <template v-else-if="actions.length > 1">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
            <span class="sr-only">Abrir menu</span>
            <MoreHorizontal class="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="(action, idx) in actions"
            :key="idx"
            @click="action.onClick"
            :class="action.className"
          >
            <component :is="action.icon" class="w-4 h-4 mr-2" />
            <span>{{ action.label }}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </template>

    <!-- v8 ignore start -->
    <Modal :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Confirmar Exclusão</ModalTitle>
          <ModalDescription class="py-2">
            {{ deleteMessage }}
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="ghost" @click="isDeleteDialogOpen = false"> Cancelar </Button>
          <Button variant="danger" @click="handleDelete"> Excluir </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    <!-- v8 ignore stop -->
  </div>
</template>
