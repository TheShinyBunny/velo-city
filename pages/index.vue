<script setup lang="ts">

useHead({
    title: 'VeloCity'
})

definePageMeta({layout: 'home'})

const github = 'https://github.com/TheShinyBunny/velo-city'

</script>

<template>
    <main class="mt-12">
        <div class="main-title">
            <h1 class="text-6xl"><VeloLogo />City</h1>
            <h2 class="text-2xl">Creating Velo code, without writing a single line.</h2>
        </div>
        <div class="centered-items mt-5">
            <NuxtLink to="/about" class="btn btn-primary">Tell me More</NuxtLink>
            <a :href="github" target="_blank" rel="noreferrer" class="btn btn-secondary"><Icon name="mdi:github" size="1.5rem" /> GitHub</a>
        </div>
    </main>
</template>

<style scoped lang="scss">
.main-title {
    @apply grid place-items-center gap-2;
}
</style>