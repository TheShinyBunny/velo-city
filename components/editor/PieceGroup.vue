<script setup lang="ts">
import type {
    AdjacentAttachment,
    Block,
    BlockAction,
    BlockGroup,
    BlockPiece,
    BlockType,
    SelectionPiece
} from '~/utils/blocks'
const emit = defineEmits(['startDragging', 'groupChanged', 'updateBlock'])

const {block, type, pieces, isFirst, isLast} = defineProps<{block: Block, type: BlockType<any>, pieces: BlockPiece<any>[], isFirst: boolean, isLast: boolean}>()
const isTemplate = inject('isTemplate', false)

const dragState = useDragState()
const mousePos = useMousePos()
const attach = useAttachTarget()
const actions = ref<BlockAction<any>[]>([])

onMounted(() => {
    if (isFirst) {
        actions.value = type.getActions?.(block.data) || []
    }
})

const containerElement = ref<HTMLElement>()

const epsilon = 12
function isBlockEdgeNearTop() {
    if (!dragState.value.draggedBlocks) return false
    if (!containerElement.value) return false
    const rect = containerElement.value!.getBoundingClientRect()
    return isBetween(rect.top, mousePos.value.y - dragState.value.offsetY, rect.top + epsilon)
        && isBetween(rect.left, mousePos.value.x - dragState.value.offsetX, rect.right)
}

function isBetween(min: number, value: number, max: number) {
    return min <= value && max >= value;
}

const canAttachInside = computed(() => !isTemplate && isGroup(pieces[0]) && !(pieces[0] as BlockGroup).blocks.length && isBlockEdgeNearTop())

let lastAttachment: AdjacentAttachment

watch(canAttachInside, (state) => {
    if (state) {
        lastAttachment = {
            type: 'adjacent',
            group: pieces[0] as BlockGroup,
            index: 0,
            offset: 'top'
        }
        attach.value = lastAttachment
    } else {
        const current = attach.value as AdjacentAttachment
        if (current && lastAttachment && lastAttachment.group === current.group && lastAttachment.index === current.index && lastAttachment.offset === current.offset) {
            attach.value = undefined
        }
    }
})

function pickUpGroup(event: MouseEvent, newGroup: BlockGroup, pickedUp: BlockGroup) {
    let rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    dragState.value = {
        draggedBlocks: pickedUp,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
    }
    emit('groupChanged', newGroup)
}

function runAction(action: BlockAction<any>) {
    const newBlock = action.run({startDragging: () => {}}, block)
    emit('updateBlock', newBlock)
}

function selectionChanged(piece: SelectionPiece<any>, selected: string) {
    if (piece.onChange) {
        const newBlock = piece.onChange(selected, block)
        emit('updateBlock', newBlock)
    }
}

</script>
<template>
    <div v-if="!pieces.length"></div>
    <div v-else-if="isGroup(pieces[0])" class="block-container" ref="containerElement">
        <div :class="[type.color]"></div>
        <div v-if="canAttachInside" class="drop-zone above"></div>
        <EditorBlockGroupRender :group="pieces[0] as BlockGroup" @pick-up="pickUpGroup" :is-template="isTemplate" />
        <div v-if="isLast" class="container-end" :class="[type.color]"></div>
    </div>
    <div v-else class="normal-piece" :class="[type.color]" @mousedown.left.stop="$emit('startDragging', $event)">
        <EditorPieceRender v-for="piece in pieces" :piece="piece" :key="piece" @change-selection="selectionChanged(piece as SelectionPiece<any>, $event)" />
        <EditorActionMenu v-if="isFirst && actions.length" :actions="actions" @mousedown.stop @run-action="runAction($event)" />
    </div>
</template>
<style scoped lang="scss">
.normal-piece {
    @apply p-2 w-fit gap-1 flex flex-wrap items-center text-white cursor-move select-none relative border-2
    border-black border-opacity-25 pointer-events-auto;
}

.block-container {
    @apply grid min-h-[6rem] relative pointer-events-none;

    & > :first-child {
        @apply border-x-2 border-black border-opacity-25 relative -top-0.5 w-4;
        height: calc(100% + 0.3rem);
    }

    &:has(.block-wrapper) {
        @apply min-h-fit grid-cols-[1rem_1fr];
    }

    &:has(.container-end) {
        @apply grid-rows-[1fr_1rem];
    }
}

.container-end {
    @apply w-32 h-4 col-span-2 border-2 border-black border-opacity-25;
}

</style>
