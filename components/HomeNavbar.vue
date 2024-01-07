<script setup lang="ts">
const {status, data, signOut, signIn} = useAuth()

let loginModalOpen = ref(false)

</script>
<template>
    <div class="absolute top-2 right-2">
        <div v-if="status === 'authenticated'">
            <Menu as="div" class="relative">
                <MenuButton class="menu-button">
                    <img :src="data?.user?.image || 'public/favicon.ico'" class="w-8 aspect-auto rounded-full" />
                    {{ data?.user?.name }}
                </MenuButton>
                <Transition enter-active-class="transition duration-100 ease-out"
                        enter-from-class="transform scale-95 opacity-0"
                        enter-to-class="transform scale-100 opacity-100"
                        leave-active-class="transition duration-75 ease-in"
                        leave-from-class="transform scale-100 opacity-100"
                        leave-to-class="transform scale-95 opacity-0">
                    <MenuItems class="menu-items">
                        <div class="p-1">
                            <MenuItem v-slot="{ active }">
                                <NuxtLink to="/dashboard" :class="[active && 'menu-item-active', 'group menu-item']">Dashboard</NuxtLink>
                            </MenuItem>
                            <MenuItem v-slot="{ active }">
                                <button :class="[active && 'menu-item-active', 'menu-item']" @click="signOut({callbackUrl: '/'})">Log Out</button>
                            </MenuItem>
                        </div>
                    </MenuItems>
                </Transition>
            </Menu>
        </div>
        <div v-else-if="status === 'unauthenticated'">
            <button class="btn btn-success" @click="loginModalOpen = true">Login</button>
        </div>
        <div v-else>
        </div>
    </div>
    <Modal width="30rem" v-if="loginModalOpen" v-model:open="loginModalOpen">
        <button class="close-fab btn btn-icon" @click="loginModalOpen = false">
            <Icon name="mdi:close" size="2rem" color="gray" />
        </button>
        <div class="login-options">
            <h3 class="text-3xl text-center">Login to VeloCity</h3>
            <button class="btn btn-secondary" @click="signIn('google', {callbackUrl: '/dashboard'})">
                <Icon name="mdi:google" />
                Login with Google
            </button>
        </div>
    </Modal>
</template>
<style scoped lang="scss">
.login-modal {
    @apply w-[30rem] max-w-[80%] h-[30rem] border border-gray-300 rounded-lg shadow-lg;
}

.close-fab {
    @apply absolute top-1 left-1 w-6 h-6;
}

.login-options {
    @apply grid items-start justify-center gap-3;
}

</style>