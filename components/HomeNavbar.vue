<script setup lang="ts">
import type { DropdownItem } from '#ui/types'

const { status, data, signOut } = useAuth()
const loginModalOpen = ref(false)

const userMenuItems: DropdownItem[][] = [
  [
    {
      label: 'Dashboard',
      to: '/dashboard'
    },
    {
      label: 'Log Out',
      click: () => {
        signOut({ callbackUrl: '/' })
      }
    }
  ]
]

</script>
<template>
  <div class="absolute top-2 right-2">
    <div v-if="status === 'authenticated'" class="z-50">
      <UDropdown :items="userMenuItems" :popper="{placement: 'bottom-end'}">
        <UButton :label="data?.user?.name || 'Loading...'">
          <template #leading>
            <UAvatar :src="data?.user?.image || 'public/favicon.ico'" />
          </template>
        </UButton>
      </UDropdown>
    </div>
    <div v-else-if="status === 'unauthenticated'">
      <UButton @click="loginModalOpen = true">
        Login
      </UButton>
    </div>
    <div v-else />
  </div>
  <ModalsSignIn v-model:open="loginModalOpen" />
</template>
<style scoped lang="scss">

</style>
