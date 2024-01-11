<script setup lang="ts">
const {open, name, projectId} = defineProps<{open: boolean, name: string, projectId: string}>()
const emit = defineEmits(['update:open', 'closed'])

let newName = ref(name)
let loading = ref(false)

async function rename() {
    loading.value = true
    await $fetch('/api/projects/rename', {method: 'POST', body: {projectId: projectId, name: newName.value}})
    loading.value = false
    emit('update:open', false)
    emit('closed', newName)
}

</script>
<template>
    <UModal :model-value="open" @update:model-value="$emit('update:open', $event)">
        <UCard>
            <div class="flex justify-between">
                <h2 class="text-3xl mb-2">Rename {{ name }}</h2>
                <UButton color="black" variant="link" icon="i-mdi-close" @click="$emit('update:open', false)" />
            </div>
            <hr />
            <div class="text-center m-4">
                <UInput autofocus v-model="newName" type="text" />
            </div>
            <div class="centered-items">
                <UButton @click="rename()" :disabled="loading" :loading="loading">Rename</UButton>
            </div>
        </UCard>
    </UModal>
</template>
