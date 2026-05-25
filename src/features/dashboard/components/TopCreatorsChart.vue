<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UserProductStat } from '../services/dashboard.service';
import { useElementSize } from '../hooks/useElementSize';

const props = defineProps<{
  data: UserProductStat[];
}>();

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

const containerRef = ref<HTMLElement | null>(null);
const { width, height } = useElementSize(containerRef);

// Chart geometry
const padding = { top: 20, right: 30, bottom: 40, left: 100 }; // Extra left padding for names

const chartWidth = computed(() => width.value - padding.left - padding.right);
const chartHeight = computed(() => height.value - padding.top - padding.bottom);

const maxValue = computed(() => {
  const max = Math.max(...props.data.map((d) => d.count), 0);
  return max === 0 ? 10 : Math.ceil(max * 1.15); // Add some padding on right
});

// Simple helper to format X-axis ticks
const xTicks = computed(() => {
  const max = maxValue.value;
  return [0, Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75), max];
});

const bars = computed(() => {
  if (props.data.length === 0) return [];
  const count = props.data.length;
  const spacing = chartHeight.value / count;
  const barHeight = Math.max(2, spacing * 0.5);

  return props.data.map((item, index) => {
    const y = padding.top + index * spacing + (spacing - barHeight) / 2;
    const barWidth = (item.count / maxValue.value) * chartWidth.value;
    const x = padding.left;

    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      item,
      index,
      color: COLORS[index % COLORS.length]
    };
  });
});

// Tooltip state
const activeIndex = ref<number | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });

const handleMouseMove = (event: MouseEvent, index: number): void => {
  const parentRect = (event.currentTarget as SVGElement).parentElement?.getBoundingClientRect();
  if (parentRect) {
    tooltipPosition.value = {
      x: event.clientX - parentRect.left + 10,
      y: event.clientY - parentRect.top - 40
    };
  }
  activeIndex.value = index;
};

const handleMouseLeave = (): void => {
  activeIndex.value = null;
};
</script>

<template>
  <div class="col-span-3 rounded-xl border border-gray-200 bg-white shadow-sm relative">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="font-semibold text-gray-900 leading-none tracking-tight">
        Top Criadores (Produtos)
      </h3>
      <p class="text-sm text-gray-500">Usuários que mais cadastraram produtos.</p>
    </div>
    <div class="p-6 pt-0">
      <div ref="containerRef" class="h-[300px] w-full relative">
        <svg
          :viewBox="`0 0 ${width} ${height}`"
          width="100%"
          height="100%"
          class="overflow-visible select-none"
        >
          <!-- Grid lines (vertical grid lines for horizontal chart) -->
          <line
            v-for="tick in xTicks"
            :key="`grid-${tick}`"
            :x1="padding.left + (tick / maxValue) * chartWidth"
            :y1="padding.top"
            :x2="padding.left + (tick / maxValue) * chartWidth"
            :y2="height - padding.bottom"
            stroke="#f0f0f0"
            stroke-dasharray="3 3"
          />

          <!-- X Axis Labels -->
          <text
            v-for="tick in xTicks"
            :key="`x-label-${tick}`"
            :x="padding.left + (tick / maxValue) * chartWidth"
            :y="height - padding.bottom + 15"
            text-anchor="middle"
            class="text-[10px] fill-gray-500 font-sans"
          >
            {{ tick }}
          </text>

          <!-- Y Axis Labels / User Names -->
          <g v-for="bar in bars" :key="`y-label-${bar.index}`">
            <text
              :x="padding.left - 8"
              :y="bar.y + bar.height / 2 + 3"
              text-anchor="end"
              class="text-[10px] fill-gray-500 font-sans"
            >
              {{ bar.item.userName || bar.item.userId }}
            </text>
          </g>

          <!-- Bars -->
          <rect
            v-for="bar in bars"
            :key="`bar-${bar.index}`"
            :x="bar.x"
            :y="bar.y"
            :width="Math.max(1, bar.width)"
            :height="bar.height"
            :fill="bar.color"
            rx="4"
            ry="4"
            class="transition-all duration-300 cursor-pointer opacity-90 hover:opacity-100"
            @mousemove="handleMouseMove($event, bar.index)"
            @mouseleave="handleMouseLeave"
          />
        </svg>

        <!-- Tooltip overlay -->
        <div
          v-if="activeIndex !== null && data[activeIndex]"
          class="absolute z-10 p-2 bg-white border border-gray-200 rounded-lg shadow-md text-xs pointer-events-none"
          :style="{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }"
        >
          <p class="font-semibold text-gray-900">
            {{ data[activeIndex].userName || data[activeIndex].userId }}
          </p>
          <p class="text-indigo-600">Quant: {{ data[activeIndex].count }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
