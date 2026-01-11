<template>
    <DefaultSection>
        <HeadingH2>Crear Piso</HeadingH2>

        <FloorForm @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useFloors } from '~/composables/useFloors.js'
import FloorForm from '~/components/admin/floor/Form.vue'

definePageMeta({
    middleware: 'admin'
})

const { createFloor } = useFloors()
const { success: showSuccess, error: showError } = useNotification()

const handleSubmit = async (floorData) => {
    try {
        await createFloor(floorData)
        showSuccess('Piso creado correctamente')
        navigateTo(ROUTE_NAMES.ADMIN.FLOORS)
    } catch (err) {
        console.error('Error creating floor:', err)
        showError('Error al crear el piso: ' + err.message, {
            title: 'Error',
            duration: 5000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ADMIN.FLOORS)
}
</script>
