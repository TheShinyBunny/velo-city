<script setup lang="ts">
import type {DropdownItem} from '#ui/types'

const {status, data, signOut, signIn} = useAuth()

let loginModalOpen = ref(false)

const userMenuItems: DropdownItem[][] = [
    [
        {
            label: 'Dashboard',
            to: '/dashboard'
        },
        {
            label: 'Log Out',
            click: () => {
                signOut({callbackUrl: '/'})
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
            <UButton @click="loginModalOpen = true">Login</UButton>
        </div>
        <div v-else>
        </div>
    </div>
    <UModal v-model="loginModalOpen">
        <UButton class="close-fab" variant="link" color="gray" @click="loginModalOpen = false" icon="i-mdi-close" />
        <div class="login-options">
            <h3 class="text-3xl text-center">Login to VeloCity</h3>
            <UButton color="blue" @click="signIn('google', {callbackUrl: '/dashboard'})">
                <UIcon name="i-mdi-google" />
                Login with Google
            </UButton>
        </div>
    </UModal>
</template>
<style scoped lang="scss">

.close-fab {
    @apply absolute top-1 left-1 w-6 h-6;
}

.login-options {
    @apply m-4 grid items-start justify-center gap-3;
}

</style>
