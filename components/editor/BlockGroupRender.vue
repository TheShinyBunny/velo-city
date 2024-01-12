<script setup lang="ts">
import type {AdjacentAttachment, Block, BlockGroup} from '~/utils/blocks'

const {group, isTemplate} = defineProps<{group: BlockGroup, isTemplate: boolean}>()
const emit = defineEmits(['pickUp'])
const {markModified} = inject('projectActions')

provide('isTemplate', isTemplate)
provide('group', group)

function startDragChild(event: MouseEvent, index: number) {
    const blocks = group.blocks.slice(index, group.blocks.length)
    emit('pickUp', event, {...group, blocks: group.blocks.slice(0, index)}, {blocks})
}

const attach = useAttachTarget()

let lastAttachment: AdjacentAttachment

function attachmentChanged(index: number, above: boolean, below: boolean) {
    if (!above && !below) {
        const current = attach.value as AdjacentAttachment
        if (current && lastAttachment && lastAttachment.group === current.group && lastAttachment.index === current.index && lastAttachment.offset === current.offset) {
            attach.value = undefined
        }
    } else {
        index += (above ? 0 : 1)
        if (index < 0) return
        lastAttachment = {
            type: 'adjacent',
            group,
            index,
            offset: above ? 'top' : 'bottom'
        }
        attach.value = lastAttachment
    }
}

function updateBlock(index: number, block: Block) {
    group.blocks[index] = block
    markModified()
}

</script>
<template>
    <div v-if="group.blocks.length" class="w-auto">
        <EditorBlockRender v-for="(block, index) in group.blocks" :key="block" :block="block" @start-dragging="startDragChild($event, index)"
                           @attach-changed="(change) => attachmentChanged(index, ...change)" @update-block="updateBlock(index, $event)"/>
    </div>
</template>
<style scoped lang="scss">

</style>
