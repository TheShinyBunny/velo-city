<script setup lang="ts">
import type {Project} from '@prisma/client'
const {$client} = useNuxtApp()

const {open, project} = defineProps<{open: boolean, project: Project}>()
defineEmits(['update:open'])
const router = useRouter()

let loading = ref(false)

async function confirmDelete() {
    loading.value = true
    await $client.projects.delete.mutate(project.id)
    loading.value = false
    router.replace('/dashboard')
}

</script>
<template>
    <UModal :model-value="open" @update:model-value="$emit('update:open', $event)">
        <UCard>
            <h2 class="text-xl text-center">Are you sure you want to delete <br/> {{ project.name }}?</h2>
            <div class="centered-items mt-3">
                <UButton color="red" @click="confirmDelete()"  :disabled="loading" :loading="loading">Delete</UButton>
                <UButton color="gray" @click="$emit('update:open', false)">Cancel</UButton>
            </div>
        </UCard>
    </UModal>
</template>
