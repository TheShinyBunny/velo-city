<script setup lang="ts">
import type { TabItem } from '#ui/types'

const { open } = defineProps<{open: boolean}>()
const emit = defineEmits(['update:open'])

const { signIn } = useAuth()
const { $client } = useNuxtApp()

const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const emailSent = ref(false)
const error = ref('')

async function signInWithEmail() {
  loading.value = true
  const result = await signIn('credentials', { email: email.value, password: password.value, redirect: false })

  if (typeof result === 'object' && result.error) {
    error.value = result.error
  } else {
    changeOpened(false)
    navigateTo('/dashboard')
  }
  loading.value = false
}

function changeOpened(isOpen: boolean) {
  emit('update:open', isOpen)
  if (!isOpen) {
    error.value = ''
    username.value = ''
    email.value = ''
    password.value = ''
    loading.value = false
    emailSent.value = false
  }
}

async function register() {
  loading.value = true
  error.value = ''
  try {
    await $client.users.register.mutate({ email: email.value, password: password.value, name: username.value })
    loading.value = false
    emailSent.value = true
  } catch (err: any) {
    error.value = err.shape.message
    loading.value = false
  }
}

const tabs: TabItem[] = [
  {
    label: 'Login',
    slot: 'login'
  },
  {
    label: 'Register',
    slot: 'register'
  }
]

</script>

<template>
  <UModal :model-value="open" @update:model-value="changeOpened">
    <UCard>
      <UButton class="close-fab" variant="link" color="gray" icon="i-mdi-close" @click="changeOpened(false)" />
      <h3 class="text-3xl text-center mb-3">
        Login to VeloCity
      </h3>
      <UAlert v-if="emailSent" color="green" title="A confirmation Email was sent to you. Open your Email and follow the instructions." />
      <UTabs v-else :items="tabs">
        <template #login>
          <div class="login-options">
            <UInput v-model="email" type="email" placeholder="Email" />
            <UInput v-model="password" type="password" placeholder="Password" />
            <div class="centered-items">
              <UButton color="gray" :loading="loading" @click="signInWithEmail()">
                Log In
              </UButton>
              <UButton color="blue" @click="signIn('google', {callbackUrl: '/dashboard'})">
                <UIcon name="i-mdi-google" />
                Login with Google
              </UButton>
            </div>
          </div>
        </template>
        <template #register>
          <div class="login-options">
            <UInput v-model="username" type="text" placeholder="Name" />
            <UInput v-model="email" type="email" placeholder="Email" />
            <UInput v-model="password" type="password" placeholder="Password" />
            <div class="centered-items">
              <UButton color="primary" :loading="loading" @click="register()">
                Register
              </UButton>
            </div>
          </div>
        </template>
      </UTabs>
      <UAlert v-if="error" color="red" :title="error" />
    </UCard>
  </UModal>
</template>

<style scoped lang="scss">
.close-fab {
    @apply absolute top-1 left-1 w-6 h-6;
}

.login-options {
    @apply m-4 grid items-start justify-center gap-3;
    grid-template-columns: 60%;
}

</style>
