<script setup lang="ts">
import type {AdjacentAttachment, BlockGroup, SlotAttachment} from '~/utils/blocks'
import {SaveStatus} from '~/composables/useSaveState'
import {useMouse} from '@vueuse/core'
const {$client} = useNuxtApp()

const AUTO_SAVE_TIMEOUT = 5000

const dragState = useDragState()
const mousePos = useMouse({type: 'page'})
const blocks = useEditorBlocks()
const attach = useAttachTarget()
const saveStatus = useSaveState()
const route = useRoute()
const {data: project, refresh} = await $client.projects.getProject.useQuery(route.params.project as string)
blocks.value = project.value!.structure as BlockGroup[]
useHead({
    title: (project.value?.name || 'Loading') + ' Editor'
})


onBeforeRouteLeave(async () => {
    if (saveStatus.value != SaveStatus.SAVED) {
        if (saveTimeout) {
            clearTimeout(saveTimeout)
        }
        await saveProject()
    }
})

onMounted(() => {
    window.addEventListener('beforeunload', beforeLeave)
})

onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeLeave)
})

let saveTimeout: any

provide('projectActions', {
    markModified: () => onProjectModified(),
    saveProject: () => saveProject(),
    duplicateDragged: () => duplicateDraggedBlocks(),
})

function onProjectModified() {
    saveStatus.value = SaveStatus.MODIFIED
    if (saveTimeout) {
        clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(() => {
        saveProject()
    }, AUTO_SAVE_TIMEOUT)
}

async function saveProject() {
    saveStatus.value = SaveStatus.SAVING
    await $client.projects.update.mutate({projectId: project.value!.id, structure: blocks.value})
    if (saveStatus.value === SaveStatus.SAVING) {
        saveStatus.value = SaveStatus.SAVED
    }
}

const canvasElement = ref<HTMLElement>()

async function releaseBlocks() {
    if (dragState.value.draggedBlocks) {
        if (attach.value) {
            if (await tryAttachBlocks()) {
                dragState.value = {}
                attach.value = undefined
                onProjectModified()
                return
            }
        }
        placeBlocksUnattached()
    }
}

function placeBlocksUnattached() {
    const canvas = canvasElement.value!
    const group = dragState.value.draggedBlocks!
    blocks.value = [...blocks.value, group]
    group.xPos = Math.round(mousePos.x.value - canvas.getBoundingClientRect().left - dragState.value.offsetX!)
    group.yPos = Math.round(mousePos.y.value - canvas.getBoundingClientRect().top - dragState.value.offsetY!)
    dragState.value = {}
    onProjectModified()
}

async function tryAttachBlocks() {
    if (attach.value?.type === 'adjacent') {
        const adjacent = attach.value as AdjacentAttachment
        const blocks = adjacent.group.blocks
        const index = adjacent.index
        const beforeAttachment = blocks[index - 1]
        const afterAttachment = blocks[index]
        const topDragged = dragState.value.draggedBlocks!.blocks[0]
        const bottomDragged = dragState.value.draggedBlocks!.blocks.at(-1)!
        if ((!beforeAttachment || (await canBlockConnectBottom(beforeAttachment) && await canBlockConnectTop(topDragged))) &&
            (!afterAttachment || (await canBlockConnectTop(afterAttachment) && await canBlockConnectBottom(bottomDragged))) &&
            (blocks.length || await canBlockConnectTop(topDragged))) {
            const tempBlocks = [...blocks]
            tempBlocks.splice(index, 0, ...dragState.value.draggedBlocks!.blocks)
            adjacent.group.blocks = tempBlocks
            return true
        }
    } else {
        const slot = attach.value as SlotAttachment
        if (dragState.value.draggedBlocks?.blocks.length === 1 && await isBlockExpression(dragState.value.draggedBlocks?.blocks[0]!)) {
            slot.property.value = dragState.value.draggedBlocks?.blocks[0]!
            if (slot.property.onAttachedBlockChange) {
                slot.updateParent(slot.property.onAttachedBlockChange(slot.property, slot.parent, slot.property.value!))
            }
            return true
        }
    }
    return false
}

function pickUpGroup(event: MouseEvent, group: BlockGroup, newGroup: BlockGroup, pickedUp: BlockGroup) {
    let rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    dragState.value = {
        draggedBlocks: pickedUp,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
    }
    const index = blocks.value.indexOf(group)
    if (newGroup.blocks.length === 0) {
        const tempBlocks = [...blocks.value]
        tempBlocks.splice(index, 1)
        blocks.value = tempBlocks
    } else {
        blocks.value[blocks.value.indexOf(group)] = newGroup
    }
    onProjectModified()
}

function duplicateDraggedBlocks() {
    if (dragState.value.draggedBlocks) {
        const clone = useCloneDeep(dragState.value)
        placeBlocksUnattached()
        dragState.value = clone
    }
}

function beforeLeave(event: Event) {
    if (saveStatus.value != SaveStatus.SAVED) {
        event.preventDefault()
        event.returnValue = false
    }
}

</script>
<template>
    <div class="relative" :class="{'select-none': dragState.draggedBlocks}">
        <EditorNavbar v-if="project" :project="project" @refresh-project="refresh()" />
        <div class="editor-container">
            <EditorBlockPalette />
            <div class="w-auto relative" @mouseup.left="releaseBlocks" ref="canvasElement">
                <div v-for="group in blocks" :key="group" class="absolute pointer-events-none" :style="{top: group.yPos + 'px', left: group.xPos + 'px'}">
                    <EditorBlockGroupRender :group="group" @pick-up="(event, newGroup, pickedUp) => pickUpGroup(event, group, newGroup, pickedUp)" :is-template="false" />
                </div>
            </div>
        </div>
        <div v-if="dragState.draggedBlocks" class="dragged-element"
             :style="{left: (mousePos.x.value - dragState.offsetX) + 'px', top: (mousePos.y.value - dragState.offsetY) + 'px'}">
            <EditorBlockGroupRender :group="dragState.draggedBlocks" :is-template="true" />
        </div>
    </div>
</template>
<style scoped lang="scss">
.editor-container {
    @apply fixed top-16 left-0 grid grid-cols-[1fr_6fr];
    height: calc(100vh - 4rem);
}

.dragged-element {
    @apply absolute z-50 pointer-events-none drop-shadow-lg select-none overflow-hidden;

    & :deep(.normal-piece, .expression-slot) {
        @apply pointer-events-none;
    }
}


</style>
