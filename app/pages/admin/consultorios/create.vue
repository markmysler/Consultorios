<template>
    <DefaultSection>
        <HeadingH2>Crear Consultorio</HeadingH2>

        <RoomForm @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRooms } from '~/composables/useRooms.js'
import RoomForm from '~/components/admin/room/Form.vue'

definePageMeta({
    middleware: 'admin'
})

const { createRoom } = useRooms()
const { success: showSuccess, error: showError } = useNotification()

const handleSubmit = async (roomData) => {
    try {
        await createRoom(roomData)
        showSuccess('Consultorio creado correctamente')
        navigateTo(ROUTE_NAMES.ADMIN.OFFICES)
    } catch (err) {
        console.error('Error creating room:', err)
        showError('Error al crear el consultorio: ' + err.message, {
            title: 'Error',
            duration: 5000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ADMIN.OFFICES)
}
</script>
