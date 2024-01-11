<script setup lang="ts">
import type {Project} from '@prisma/client'
import type {Ref} from 'vue'

const {data} = useAuthState()
const {data: projects}: {data: Ref<Project[]>} = await useLazyFetch(`/api/projects/user/${data.value?.user.id}`, {key: 'projects'})

async function createProject() {
    const res = await $fetch('/api/projects/create', {body: {name: 'Untitled Project'}, method: 'POST'})
    await navigateTo(`/editor/blocks/${res.id}`)
}

</script>
<template>
    <div class="project-list">
        <div class="card new-project" @click="createProject()">
            <UIcon name="i-mdi-add" />
            <p>Create New Project</p>
        </div>
        <NuxtLink v-for="project in projects" class="card" :to="`/editor/blocks/${project.id}`">
            <p>{{ project.name }}</p>
        </NuxtLink>
    </div>
</template>
<style scoped lang="scss">
.project-list {
    @apply flex gap-4 flex-wrap m-6;
}

.card {
    @apply w-32 h-24 bg-white shadow-lg rounded-sm grid items-center justify-items-center p-3 border border-opacity-20 border-gray-400 text-center hover:shadow-md transition-shadow duration-200;
}

.new-project {
    @apply bg-blue-200 cursor-pointer hover:bg-blue-300 transition-colors;
}
</style>
