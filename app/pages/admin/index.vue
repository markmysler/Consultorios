<template>
    <DefaultSection>
        <HeadingH2>Administración</HeadingH2>

        <div class="max-w-[37.5rem] lg:max-w-[58rem] flex justify-center flex-wrap gap-4 lg:gap-6">
            <ButtonPrimary
                v-for="(section, index) in adminSections"
                :key="index"
                @click="navigateTo(section.route)"
                class="!max-w-72 flex justify-center items-center gap-3">
                <Icon :name="section.icon" class="w-8 h-8" />
                {{ section.title }}
            </ButtonPrimary>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const adminSections = [
    {
        title: 'Sectores',
        icon: 'tabler:building',
        route: ROUTE_NAMES.ADMIN.FLOORS
    },
    {
        title: 'Consultorios',
        icon: 'tabler:door',
        route: ROUTE_NAMES.ADMIN.OFFICES
    },
    {
        title: 'Profesionales',
        icon: 'tabler:users',
        route: ROUTE_NAMES.ADMIN.PROFESSIONALS
    },
    {
        title: 'Horarios',
        icon: 'tabler:clock',
        route: ROUTE_NAMES.ADMIN.SCHEDULES
    },
    {
        title: 'Licencias',
        icon: 'tabler:certificate',
        route: ROUTE_NAMES.ADMIN.LICENSES
    }
]
</script>
