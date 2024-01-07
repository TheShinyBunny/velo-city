<script setup lang="ts">
import type {Ref} from 'vue'
import type {Project} from '@prisma/client'
import type {AdjacentAttachment, BlockGroup, SlotAttachment} from '~/utils/blocks'
import {SaveStatus} from '~/composables/useSaveState'

const AUTO_SAVE_TIMEOUT = 5000

const dragState = useDragState()
const mousePos = useMousePos()
const blocks = useEditorBlocks()
const attach = useAttachTarget()
const saveStatus = useSaveState()
const route = useRoute()
const {data: project, refresh}: {data: Ref<Project>} = await useFetch(`/api/projects/get/${route.params.project}`, {
    onResponse({response}) {
        blocks.value = response._data.structure
    }
})
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
    saveProject: () => saveProject()
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
    await $fetch('/api/projects/update', {body: {projectId: project.value.id, structure: blocks.value}, method: 'POST'})
    saveStatus.value = SaveStatus.SAVED
}

function setMousePos(event: MouseEvent) {
    mousePos.value = {x: event.pageX, y: event.pageY}
}

const canvasElement = ref<HTMLElement>()

async function placeBlocks(event: MouseEvent) {
    if (dragState.value.draggedBlocks) {
        if (attach.value) {
            if (await tryAttachBlocks()) {
                dragState.value = {}
                onProjectModified()
                return
            }
        }
        const canvas = canvasElement.value!
        const group = dragState.value.draggedBlocks
        blocks.value = [...blocks.value, group]
        group.xPos = Math.round(event.pageX - canvas.getBoundingClientRect().left - dragState.value.offsetX)
        group.yPos = Math.round(event.pageY - canvas.getBoundingClientRect().top - dragState.value.offsetY)
        dragState.value = {}
        onProjectModified()
    }
}

async function tryAttachBlocks() {
    if (attach.value?.type === 'adjacent') {
        const adjacent = attach.value as AdjacentAttachment
        const blocks = adjacent.group.blocks
        const index = adjacent.index
        const beforeAttachment = blocks[index - 1]
        const afterAttachment = blocks[index]
        const topDragged = dragState.value.draggedBlocks!.blocks[0]
        const bottomDragged = dragState.value.draggedBlocks!.blocks.at(-1)
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

function beforeLeave(event: Event) {
    if (saveStatus.value != SaveStatus.SAVED) {
        event.preventDefault()
        event.returnValue = false
    }
}

</script>
<template>
    <div class="relative" @mousemove="setMousePos" :class="{'select-none': dragState.draggedBlocks}">
        <EditorNavbar v-if="project" :project="project" @refresh-project="refresh()" />
        <div class="editor-container">
            <EditorBlockPalette />
            <div class="w-auto relative" @mouseup.left="placeBlocks" ref="canvasElement">
                <div v-for="group in blocks" :key="group" class="absolute pointer-events-none" :style="{top: group.yPos + 'px', left: group.xPos + 'px'}">
                    <EditorBlockGroupRender :group="group" @pick-up="(event, newGroup, pickedUp) => pickUpGroup(event, group, newGroup, pickedUp)" :is-template="false" />
                </div>
            </div>
        </div>
        <div v-if="dragState.draggedBlocks" class="dragged-element"
             :style="{left: (mousePos.x - dragState.offsetX) + 'px', top: (mousePos.y - dragState.offsetY) + 'px'}">
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
