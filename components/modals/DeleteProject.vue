<script setup lang="ts">
import type {Project} from '@prisma/client'

const {open, project} = defineProps<{open: boolean, project: Project}>()
defineEmits(['update:open'])
const router = useRouter()

let loading = ref(false)

async function confirmDelete() {
    loading.value = true
    await useFetch('/api/projects/delete', {body: {projectId: project.id}})
    loading.value = false
    router.replace('/dashboard')
}

</script>
<template>
    <Modal :open="open" @update:open="$emit('update:open', $event)">
        <h2 class="text-xl text-center">Are you sure you want to delete <br/> {{ project.name }}?</h2>
        <div class="centered-items mt-3">
            <button class="btn btn-danger" @click="confirmDelete()" :disabled="loading">
                <LoadingSpinner :size="1" color="white" type="linear" v-if="loading" />
                Delete
            </button>
            <button class="btn btn-secondary" @click="$emit('update:open', false)">Cancel</button>
        </div>
    </Modal>
</template>
