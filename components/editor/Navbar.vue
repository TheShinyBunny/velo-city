<script setup lang="ts">
import type { Project } from '@prisma/client'
import type { DropdownItem } from '#ui/types'
import { SaveStatus } from '~/composables/useSaveState'
import type { BlockGroup } from '~/utils/blocks'

const { project } = defineProps<{project: Project}>()
const emit = defineEmits(['refreshProject'])

const renameModal = ref(false)
const deleteModal = ref(false)
const resultsModal = ref(false)
const compilationResults = ref('')

const dragState = useDragState()
const blocks = useEditorBlocks()
const saveStatus = useSaveState()
const { metaSymbol } = useShortcuts()

function deleteDragged() {
  if (dragState.value.draggedBlocks) {
    dragState.value = {}
  }
}

function compile() {
  const compiler = new Compiler()
  for (const group of blocks.value) {
    compiler.writeGroup(group as BlockGroup)
  }
  compilationResults.value = compiler.createOutput()
  resultsModal.value = true
}

const { saveProject, duplicateDragged } = inject(projectActions)!

defineShortcuts({
  meta_s: () => saveProject(),
  meta_d: {
    handler: () => duplicateDragged(),
    whenever: [() => !!dragState.value.draggedBlocks]
  }
})

const fileMenu = computed<DropdownItem[][]>(() => [
  [
    {
      label: 'New...'
    },
    {
      label: 'Recent Projects'
    },
    {
      label: 'Dashboard',
      to: '/dashboard'
    }
  ],
  [
    {
      label: 'Save',
      shortcuts: [metaSymbol.value, 'S'],
      click: () => saveProject()
    },
    {
      label: 'Rename',
      click: () => renameModal.value = true
    },
    {
      label: 'Delete Project',
      click: () => deleteModal.value = true
    }
  ]
])

const blocksMenu = computed<DropdownItem[][]>(() => [
  [
    {
      label: 'Copy',
      shortcuts: [metaSymbol.value, 'C']
    },
    {
      label: 'Paste',
      shortcuts: [metaSymbol.value, 'V']
    },
    {
      label: 'Duplicate',
      shortcuts: [metaSymbol.value, 'D'],
      click: () => duplicateDragged(),
      disabled: !dragState.value.draggedBlocks
    }
  ],
  [
    {
      label: 'Create Custom Block'
    },
    {
      label: 'My Custom Blocks'
    }
  ]
])

</script>
<template>
  <div class="navbar" @mouseup.left="deleteDragged()">
    <NuxtLink to="/dashboard">
      <h1 class="logo">
        <VeloLogo />City <span>Editor</span>
      </h1>
    </NuxtLink>
    <UDropdown :items="fileMenu" :popper="{placement: 'bottom-start'}">
      <UButton size="lg" color="white" label="File" />
    </UDropdown>
    <UDropdown :items="blocksMenu" :popper="{placement: 'bottom-start'}">
      <UButton size="lg" color="white" label="Blocks" />
    </UDropdown>
    <div class="flex-grow" />
    <h2 class="text-3xl">
      {{ project.name }}
    </h2>
    <div class="flex-grow" />
    <div class="w-24 px-2">
      <span v-if="saveStatus == SaveStatus.SAVED"><UIcon name="i-mdi-check" /> Saved</span>
      <span v-else-if="saveStatus == SaveStatus.SAVING">Saving...</span>
    </div>
    <UButton size="lg" @click="compile()">
      Generate
    </UButton>
  </div>
  <ModalsRenameProject v-model:open="renameModal" :name="project.name" :project-id="project.id" @closed="emit('refreshProject')" />
  <ModalsDeleteProject v-model:open="deleteModal" :project="project" />
  <ModalsCompilationResult v-model:open="resultsModal" :results="compilationResults" />
</template>
<style scoped lang="scss">
.navbar {
    @apply fixed flex items-center gap-5 top-0 h-16 z-50 w-full bg-blue-400 shadow-lg shadow-gray-400 px-3;
}

.logo {
    @apply text-5xl text-white cursor-pointer;

    span {
        @apply text-3xl font-light;
    }
}

</style>
