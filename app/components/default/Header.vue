<template>
    <header>
        <button @click="toggleDrawer">
            <Icon name="tabler:menu-2" />
        </button>

        <NuxtLink :to="ROUTE_NAMES.HOME">
            <HeadingH1>App Consultorios Externos</HeadingH1>
        </NuxtLink>

        <NavDrawer :is-open="isDrawerOpen" @close="closeDrawer" />
    </header>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const isDrawerOpen = ref(false)

const toggleDrawer = () => {
    isDrawerOpen.value = !isDrawerOpen.value
}

const closeDrawer = () => {
    isDrawerOpen.value = false
}

const route = useRoute()
watch(() => route.path, () => {
    closeDrawer()
})
</script>