<script setup lang="ts">
import { useUrlSearchParams } from '@vueuse/core'

const { $client } = useNuxtApp()
const searchParams = useUrlSearchParams()

const checking = ref(true)
const error = ref('')
const loading = ref(false)
const verified = ref(false)

useHead({
  title: 'VeloCity - Confirm Registration'
})

onMounted(async () => {
  try {
    await $client.users.checkToken.mutate({ token: searchParams.token as string, type: 'REGISTER' })
  } catch (err: any) {
    error.value = err.shape.message
  }
  checking.value = false
})

async function verify() {
  loading.value = true
  try {
    await $client.users.confirmToken.mutate({ token: searchParams.token as string, type: 'REGISTER' })

    loading.value = false
    verified.value = true
  } catch (err: any) {
    error.value = err.shape.message
  }
}

</script>

<template>
  <div class="grid place-items-center h-screen">
    <UCard class="w-1/3 text-center">
      <UAlert v-if="error" :title="'Error: ' + error" color="red" />
      <div v-else-if="verified">
        <UAlert class="mb-3" title="Your account is verified!" color="green" />
        <UButton color="primary" to="/?openLogin=true">
          Login
        </UButton>
      </div>
      <div v-else-if="!checking">
        <h1 class="text-2xl mb-3">
          Verify Your Email
        </h1>
        <UButton color="primary" :loading="loading" @click="verify()">
          Verify
        </UButton>
      </div>
      <USkeleton v-else class="h-12 w-full" />
    </UCard>
  </div>
</template>

<style scoped lang="scss">

</style>
