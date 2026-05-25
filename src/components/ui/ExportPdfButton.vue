<script setup lang="ts">
import { ref } from 'vue';
import { FileText } from 'lucide-vue-next';
import Button from './Button.vue';
import { downloadPdf } from '@/utils/download';

interface ExportPdfParams {
  searchWord?: string;
  searchFields?: string[];
  filters?: Record<string, unknown>;
  sort?: { orderBy?: string; orderDirection?: string };
}

interface Props {
  onExport: (params: ExportPdfParams) => Promise<Blob>;
  queryParams: ExportPdfParams;
  filename?: string;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  filename: 'relatorio.pdf',
  label: 'Exportar PDF'
});

const isExporting = ref(false);

const handleExport = async (): Promise<void> => {
  try {
    isExporting.value = true;
    const blob = await props.onExport(props.queryParams);
    downloadPdf(blob, props.filename);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
  } finally {
    isExporting.value = false;
  }
};
</script>

<template>
  <Button variant="secondary" :is-loading="isExporting" @click="handleExport">
    <FileText class="w-4 h-4 mr-2" />
    {{ label }}
  </Button>
</template>
