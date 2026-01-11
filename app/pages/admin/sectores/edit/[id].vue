<template>
    <DefaultSection>
        <HeadingH2>Editar Piso</HeadingH2>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <FloorForm v-else :is-editing="true" :initial-data="currentFloor" @submit="handleSubmit"
            @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useFloors } from '~/composables/useFloors.js'
import FloorForm from '~/components/admin/floor/Form.vue'

const route = useRoute()
const { currentFloor, loading, fetchFloorById, updateFloor } = useFloors()
const { success: showSuccess, error: showError } = useNotification()

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchFloorById(id)
    } catch (err) {
        showError('Error al cargar el piso')
        console.error('Error loading floor:', err)
        navigateTo(ROUTE_NAMES.ADMIN.FLOORS)
    }
})

const handleSubmit = async (floorData) => {
    try {
        const id = route.params.id
        await updateFloor(id, floorData)
        showSuccess('Piso actualizado correctamente')
        navigateTo(ROUTE_NAMES.ADMIN.FLOORS)
    } catch (err) {
        console.error('Error updating floor:', err)
        showError('Error al actualizar el piso: ' + err.message, {
            title: 'Error',
            duration: 5000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ADMIN.FLOORS)
}
</script>
