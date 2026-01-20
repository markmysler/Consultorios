<template>
    <DefaultSection>
        <HeadingH2>Editar Consultorio</HeadingH2>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <RoomForm v-else :is-editing="true" :initial-data="currentRoom" @submit="handleSubmit"
            @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRooms } from '~/composables/useRooms.js'
import RoomForm from '~/components/admin/room/Form.vue'

definePageMeta({
    middleware: 'admin'
})

const route = useRoute()
const { currentRoom, loading, fetchRoomById, updateRoom } = useRooms()
const { success: showSuccess, error: showError } = useNotification()

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchRoomById(id)
    } catch (err) {
        showError('Error al cargar el consultorio')
        console.error('Error loading room:', err)
        navigateTo(ROUTE_NAMES.ADMIN.OFFICES)
    }
})

const handleSubmit = async (roomData) => {
    try {
        const id = route.params.id
        await updateRoom(id, roomData)
        showSuccess('Consultorio actualizado correctamente')
        navigateTo(ROUTE_NAMES.ADMIN.OFFICES)
    } catch (err) {
        console.error('Error updating room:', err)
        showError('Error al actualizar el consultorio: ' + err.message, {
            title: 'Error',
            duration: 5000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ADMIN.OFFICES)
}
</script>
