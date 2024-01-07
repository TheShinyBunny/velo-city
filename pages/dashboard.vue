<script setup lang="ts">
useHead({title: 'VeloCity Dashboard'})
definePageMeta({middleware: 'auth', layout: 'home'})
</script>

<template>
    <Breadcrumbs class="p-2" :pages="[{label: 'Home', link: '/'}, {label: 'Dashboard'}]" />
    <div class="m-4">
        <h1 class="title">My Projects</h1>
        <ProjectList />
    </div>
</template>

<style scoped>

</style>