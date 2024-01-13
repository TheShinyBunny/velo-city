<script setup lang="ts">

useHead({
  title: 'VeloCity'
})

definePageMeta({ layout: 'home' })

const github = 'https://github.com/TheShinyBunny/velo-city'

</script>

<template>
  <main class="mt-12">
    <div class="main-title">
      <h1 class="text-6xl">
        <VeloLogo />City
      </h1>
      <h2 class="text-2xl">
        Creating Velo code, without writing a single line.
      </h2>
    </div>
    <div class="centered-items mt-5">
      <UButton to="/about">
        Tell me More
      </UButton>
      <UButton :to="github" target="_blank" rel="noreferrer" icon="i-mdi-github">
        GitHub
      </UButton>
    </div>
  </main>
</template>

<style scoped lang="scss">
.main-title {
    @apply grid place-items-center gap-2;
}
</style>
