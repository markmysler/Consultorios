<template>
    <header>
        <NuxtLink :to="ROUTE_NAMES.LOGIN">
            <HeadingH1>App Consultorios Externos</HeadingH1>
        </NuxtLink>
    </header>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
</script>