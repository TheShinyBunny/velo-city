<script setup lang="ts">
const { open, name, projectId } = defineProps<{open: boolean, name: string, projectId: string}>()
const emit = defineEmits(['update:open', 'closed'])
const { $client } = useNuxtApp()

const newName = ref(name)
const loading = ref(false)

async function rename() {
  loading.value = true
  await $client.projects.rename.mutate({ projectId, name: newName.value })
  loading.value = false
  emit('update:open', false)
  emit('closed', newName)
}

</script>
<template>
  <UModal :model-value="open" @update:model-value="$emit('update:open', $event)">
    <UCard>
      <div class="flex justify-between">
        <h2 class="text-3xl mb-2">
          Rename {{ name }}
        </h2>
        <UButton color="black" variant="link" icon="i-mdi-close" @click="$emit('update:open', false)" />
      </div>
      <hr>
      <div class="text-center m-4">
        <UInput v-model="newName" autofocus type="text" />
      </div>
      <div class="centered-items">
        <UButton :disabled="loading" :loading="loading" @click="rename()">
          Rename
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>
