<template>
    <DefaultSection>
        <HeadingH1>Consultorios</HeadingH1>
        <ButtonPrimary @click="handleCreate">
            <Icon name="tabler:plus" class="w-5 h-5 mr-2" />
            Nuevo Consultorio
        </ButtonPrimary>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="rooms.length === 0" class="text-center py-12">
            <Icon name="tabler:door" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay consultorios disponibles</p>
        </div>

        <TableLayout v-else :data="rooms" :columns="tabla.columns"
            :empty-state-text="`No hay consultorios creados`" table-name="consultorios" :show-actions="true"
            :show-delete="true" @edit="handleEdit" @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRooms } from '~/composables/useRooms.js'

const { rooms, loading, fetchRooms, deleteRoom } = useRooms()
const { success: showSuccess, error: showError } = useNotification()

const tabla = {
    columns: [
        {
            key: 'numero',
            label: 'Número',
            type: 'number'
        },
        {
            key: 'nombre',
            label: 'Nombre',
        },
        {
            key: 'piso.nombre',
            label: 'Piso',
        }
    ]
}

onMounted(async () => {
    try {
        await fetchRooms()
    } catch (err) {
        console.error('Error loading rooms:', err)
    }
})

const handleCreate = () => {
    navigateTo(ROUTE_NAMES.ADMIN.CREATE_OFFICE)
}

const handleEdit = (room) => {
    navigateTo(ROUTE_NAMES.ADMIN.EDIT_OFFICE(room.id))
}

const handleDelete = async (room) => {
    try {
        await deleteRoom(room.id)
        showSuccess('Consultorio eliminado correctamente')
    } catch (err) {
        showError('Error al eliminar el consultorio')
        console.error('Error deleting room:', err)
    }
}
</script>
