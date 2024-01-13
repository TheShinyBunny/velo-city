<script setup lang="ts">
import type { BlockCategory } from '~/utils/palette'
import { type Block } from '~/utils/blocks'
import { isInsideTemplate } from '~/utils/injection-keys'

const { category } = defineProps<{category: BlockCategory}>()
defineEmits(['selected'])

const dragState = useDragState()

function startDragging(event: MouseEvent, block: Block) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  dragState.value = {
    draggedBlocks: { blocks: [useCloneDeep(block)] },
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  }
}

provide(isInsideTemplate, true)

</script>
<template>
  <div class="grid gap-2 px-1">
    <EditorBlockRender v-for="block in category.blocks" :key="block" :block="block" @start-dragging="startDragging($event, block)" />
  </div>
</template>
<style scoped lang="scss">
.category-blocks {
    @apply grid gap-3;
}
</style>
