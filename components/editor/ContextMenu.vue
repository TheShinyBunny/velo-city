<script setup lang="ts">
import type {Block, BlockGroup} from '~/utils/blocks'
import type {DropdownItem} from '#ui/types'
import {EventBlockType} from '~/utils/events'
const {open, block} = defineProps<{open: boolean, block: Block}>()
const emit = defineEmits(['update:open', 'deleteBlock'])
const dragState = useDragState()
const contextMenu = useContextMenu()
const group: BlockGroup | undefined = inject('group')

const items: DropdownItem[] = [
    {
        label: 'Remove',
        click: () => {
            emit('deleteBlock')
        }
    },
    {
        label: 'Duplicate',
        click: () => {
            dragState.value = {
                draggedBlocks: {blocks: [useCloneDeep(block)]},
                offsetX: 10,
                offsetY: 10
            }
        }
    },
    ...addIf(getBlockTypeNow(block) instanceof EventBlockType, {
        label: 'Duplicate All',
        click: () => {
            dragState.value = {
                draggedBlocks: {blocks: useCloneDeep(group!.blocks)},
                offsetX: 10,
                offsetY: 10
            }
        }
    })
]

function runAction(item: DropdownItem) {
    item.click?.call(this);
    emit('update:open', false)
}

</script>

<template>
    <UContextMenu @mousedown.left.stop :model-value="open" @update:model-value="$emit('update:open', $event)" :virtual-element="contextMenu.element">
        <div class="p-1">
            <button v-for="item of items" class="group flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md text-gray-700
            dark:text-gray-200 hover:bg-gray-100 hover:dark:bg-gray-900 hover:text-gray-900 hover:dark:text-white" @click="runAction(item)">
                <span class="truncate">{{item.label}}</span>
            </button>
        </div>
    </UContextMenu>
</template>

<style scoped lang="scss">

</style>
