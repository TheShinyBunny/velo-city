<script setup lang="ts">
import type { TabItem } from '#ui/types'

const { open } = defineProps<{open: boolean}>()
const emit = defineEmits(['update:open'])

const { signIn } = useAuth()
const { $client } = useNuxtApp()

const username = ref('')
const email = ref('')
const password = ref('')
const resetPassword = ref(false)
const loading = ref(false)
const registerEmailSent = ref(false)
const resetEmailSent = ref(false)
const error = ref('')

async function signInWithEmail() {
  loading.value = true
  error.value = ''
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
  setTimeout(() => {
    if (!isOpen) {
      error.value = ''
      username.value = ''
      email.value = ''
      password.value = ''
      loading.value = false
      registerEmailSent.value = false
      resetEmailSent.value = false
      resetPassword.value = false
    }
  }, 300)
}

async function register() {
  loading.value = true
  error.value = ''
  try {
    await $client.users.register.mutate({ email: email.value, password: password.value, name: username.value })
    registerEmailSent.value = true
  } catch (err: any) {
    error.value = err.shape.message
  }
  loading.value = false
}

async function sendResetPassword() {
  loading.value = true
  error.value = ''
  try {
    await $client.users.requestResetPassword.mutate({ email: email.value })
    resetEmailSent.value = true
  } catch (err: any) {
    error.value = err.shape.message
  }
  loading.value = false
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
      <div v-if="resetPassword">
        <UButton variant="link" icon="i-mdi-arrow-back" @click="resetPassword = false; resetEmailSent = false">
          Back to Login
        </UButton>
        <UAlert v-if="resetEmailSent" color="green" title="If an account with this Email exists, it should receive an Email with a link to reset the password." />
        <div v-else class="login-options">
          <UInput v-model="email" type="email" placeholder="Email" />
          <div class="centered-items">
            <UButton color="gray" :loading="loading" @click="sendResetPassword()">
              Reset Password
            </UButton>
          </div>
        </div>
      </div>
      <UAlert v-else-if="registerEmailSent" color="green" title="A confirmation Email was sent to you. Open your Email and follow the instructions." />
      <UTabs v-else :items="tabs">
        <template #login>
          <div class="login-options">
            <div class="centered-items">
              <UButton color="blue" @click="signIn('google', {callbackUrl: '/dashboard'})">
                <UIcon name="i-mdi-google" />
                Login with Google
              </UButton>
            </div>
            <UInput v-model="email" type="email" placeholder="Email" />
            <UInput v-model="password" type="password" placeholder="Password" />
            <div class="centered-items">
              <UButton color="gray" :loading="loading" @click="signInWithEmail()">
                Log In
              </UButton>
            </div>
            <div class="flex items-center">
              <p>Forgot your password?</p>
              <UButton variant="link" class="inline-block" @click="resetPassword = true">
                Reset Password
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
    @apply absolute top-1 right-1 w-6 h-6;
}

.login-options {
    @apply m-4 grid items-start justify-center gap-3;
    grid-template-columns: 70%;
}

</style>
