<script setup lang="ts">
import { useUrlSearchParams } from '@vueuse/core'
import type { User } from '@prisma/client'

const { $client } = useNuxtApp()
const searchParams = useUrlSearchParams()

const checking = ref(true)
const user = ref<User>()
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const completed = ref(false)

useHead({
  title: 'VeloCity - Reset Password'
})

onMounted(async () => {
  try {
    user.value = await $client.users.checkToken.mutate({ token: searchParams.token as string, type: 'PASSWORD_RESET' })
  } catch (err: any) {
    error.value = err.shape.message
  }
  checking.value = false
})

async function resetPassword() {
  error.value = ''
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match!'
    return
  }
  loading.value = true
  try {
    await $client.users.confirmToken.mutate({ token: searchParams.token as string, type: 'PASSWORD_RESET', newPassword: newPassword.value })

    loading.value = false
    completed.value = true
  } catch (err: any) {
    error.value = err.shape.message
  }
}

</script>

<template>
  <div class="grid place-items-center h-screen">
    <UCard class="w-1/3 text-center">
      <UAlert v-if="error" :title="'Error: ' + error" color="red" />
      <div v-if="completed">
        <UAlert class="mb-3" title="Your password was reset!" color="green" />
        <UButton color="primary" to="/?openLogin=true">
          Login
        </UButton>
      </div>
      <USkeleton v-if="checking" class="h-12 w-full" />
      <div v-else-if="!completed && user">
        <h1 class="text-2xl">
          Welcome back, {{ user!.name }}!
        </h1>
        <p>Choose a new Password for your account: ({{ user!.email }})</p>
        <div class="grid place-items-center mt-3 gap-3">
          <UInput v-model="newPassword" placeholder="New Password" type="password" autofocus />
          <UInput v-model="confirmPassword" placeholder="Confirm Password" type="password" />
          <UButton color="primary" :loading="loading" :disabled="!newPassword || !confirmPassword" @click="resetPassword()">
            Reset Password
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<style scoped lang="scss">

</style>
