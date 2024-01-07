<script setup lang="ts">
import type {BlockCategory} from '~/utils/palette'
import {type Block, createSingleGroup} from '~/utils/blocks'

const {category, isOpen} = defineProps<{category: BlockCategory, isOpen: boolean}>()
defineEmits(['selected'])

const dragState = useDragState()

function startDragging(event: MouseEvent, block: Block) {
    let rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    dragState.value = {
        draggedBlocks: createSingleGroup(block),
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
    }
}

provide('isTemplate', true)

</script>
<template>
    <div class="grid gap-2 px-1">
        <div class="category-title" @click="$emit('selected')">
            <span>{{ category.name }}</span>
            <Icon :name="isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
        </div>
        <div v-if="isOpen" class="category-blocks">
            <EditorBlockRender v-for="block in category.blocks" :key="block" :block="block" @start-dragging="startDragging($event, block)" />
        </div>
    </div>
</template>
<style scoped lang="scss">
.category-title {
    @apply text-xl py-2 cursor-pointer flex justify-between items-center;
}

.category-blocks {
    @apply grid gap-3;
}
</style>
