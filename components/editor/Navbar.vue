<script setup lang="ts">
import type {Project} from '@prisma/client'
import {SaveStatus} from '~/composables/useSaveState'

const {project} = defineProps<{project: Project}>()
const emit = defineEmits(['refreshProject'])

let renameModal = ref(false)
let deleteModal = ref(false)

const dragState = useDragState()
const blocks = useEditorBlocks()
const saveStatus = useSaveState()

function deleteDragged() {
    if (dragState.value.draggedBlocks) {
        dragState.value = {}
    }
}

const {saveProject} = inject('projectActions')

</script>
<template>
    <div class="navbar" @mouseup.left="deleteDragged()">
        <NuxtLink to="/dashboard"><h1 class="logo"><VeloLogo />City <span>Editor</span></h1></NuxtLink>
        <Menu as="div" class="relative">
            <MenuButton class="menu-button">
                File
            </MenuButton>
            <Transition enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0">
                <MenuItems class="menu-items right">
                    <div class="p-1">
                        <MenuItem v-slot="{ active }">
                            <button :class="[active && 'menu-item-active', 'group menu-item']">New...</button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                            <button :class="[active && 'menu-item-active', 'group menu-item']">Recent Projects</button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                            <button :class="[active && 'menu-item-active', 'group menu-item']">Dashboard</button>
                        </MenuItem>
                    </div>
                    <div class="p-1">
                        <MenuItem v-slot="{ active }">
                            <button :class="[active && 'menu-item-active', 'group menu-item']" @click="saveProject()">Save</button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                            <button :class="[active && 'menu-item-active', 'group menu-item']" @click="renameModal = true">Rename</button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                            <button :class="[active && 'menu-item-active', 'group menu-item']" @click="deleteModal = true">Delete Project</button>
                        </MenuItem>
                    </div>
                </MenuItems>
            </Transition>
        </Menu>
        <div class="flex-grow"></div>
        <h2 class="text-3xl">{{ project.name }}</h2>
        <div class="flex-grow"></div>
        <div class="w-24 px-2">
            <span v-if="saveStatus == SaveStatus.SAVED"><Icon name="mdi:check" size="1.3rem" /> Saved</span>
            <span v-else-if="saveStatus == SaveStatus.SAVING">Saving...</span>
        </div>
    </div>
    <ModalsRenameProject :name="project.name" :project-id="project.id" v-model:open="renameModal" @closed="emit('refreshProject')" />
    <ModalsDeleteProject v-model:open="deleteModal" :project="project" />
</template>
<style scoped lang="scss">
.navbar {
    @apply fixed flex items-center gap-5 top-0 h-16 z-50 w-full bg-blue-400 shadow-lg shadow-gray-400;
}

.logo {
    @apply text-5xl text-white cursor-pointer;

    span {
        @apply text-3xl font-light;
    }
}

</style>
