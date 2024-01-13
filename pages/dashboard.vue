<script setup lang="ts">
useHead({ title: 'VeloCity Dashboard' })
definePageMeta({ middleware: 'auth', layout: 'home' })
</script>

<template>
  <UBreadcrumb class="p-2 static" :links="[{label: 'Home', to: '/'}, {label: 'Dashboard'}]" />
  <div class="m-4">
    <h1 class="title">
      My Projects
    </h1>
    <ProjectList />
  </div>
</template>

<style scoped>

</style>
