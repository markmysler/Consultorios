<template>
    <header class="flex justify-center items-center bg-secondary py-4 lg:py-6">
        <NuxtLink :to="ROUTE_NAMES.LOGIN">
            <HeadingH1>Consultorios Externos</HeadingH1>
        </NuxtLink>
    </header>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
</script>