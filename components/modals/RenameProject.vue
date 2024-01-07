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
    <Modal :open="open" @update:open="emit('update:open', $event)">
        <h2 class="text-3xl mb-2">Rename {{ name }}</h2>
        <hr />
        <div class="text-center mt-4">
            <input class="input" autofocus v-model="newName" type="text" />
        </div>
        <div class="centered-items">
            <button class="btn btn-primary" @click="rename()" :disabled="loading">
                <LoadingSpinner :size="1" color="white" type="linear" v-if="loading" />
                Rename
            </button>
        </div>
    </Modal>
</template>
