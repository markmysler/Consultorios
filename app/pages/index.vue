<template>
    <DefaultSection>
        <HeadingH2>Seleccione un Sector</HeadingH2>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="floors.length === 0" class="text-center py-12">
            <Icon name="tabler:building" class="w-16 h-16 mx-auto text-gray-dark" />
            <p class="text-dark text-lg mt-4">No hay sectores disponibles</p>
        </div>

        <div v-else class="w-full max-w-2xl grid grid-cols-2 gap-4 lg:gap-6">
            <button v-for="floor in floors" :key="floor.id" @click="handleSectorClick(floor.id)"
                class="bg-primary text-light md:text-xl lg:text-2xl font-bold rounded-xl shadow-lg px-6 py-8 lg:py-12">
                {{ floor.name }}
            </button>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useFloors } from '~/composables/useFloors.js'

const { floors, loading, fetchFloors } = useFloors()

onMounted(async () => {
    try {
        await fetchFloors()
    } catch (err) {
        console.error('Error loading floors:', err)
    }
})

const handleSectorClick = (id) => {
    navigateTo(ROUTE_NAMES.SECTOR_DETAIL(id))
}
</script>