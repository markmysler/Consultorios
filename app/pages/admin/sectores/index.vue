<template>
    <DefaultSection>
        <HeadingH2>Sectores</HeadingH2>
        <ButtonPrimary @click="handleCreate" class="flex justify-center items-center">
            <Icon name="tabler:plus" class="w-5 h-5 mr-2" />
            Nuevo Sector
        </ButtonPrimary>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="floors.length === 0" class="text-center py-12">
            <Icon name="tabler:building" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay sectores disponibles</p>
        </div>

        <TableLayout v-else :data="floors" :columns="tabla.columns"
            :empty-state-text="`No hay sectores creados`" table-name="sectores" :show-actions="true"
            :show-delete="true" :delete-warning-getter="getDeleteWarning" @edit="handleEdit" @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useFloors } from '~/composables/useFloors.js'

definePageMeta({
    middleware: 'admin'
})

const { floors, loading, fetchFloors, deleteFloor } = useFloors()
const { success: showSuccess, error: showError } = useNotification()

const tabla = {
    columns: [
        {
            key: 'name',
            label: 'Nombre',
        },
        {
            key: 'display_order',
            label: 'Orden',
            type: 'number'
        }
    ]
}

onMounted(async () => {
    try {
        await fetchFloors()
    } catch (err) {
        console.error('Error loading floors:', err)
    }
})

const getDeleteWarning = (floor) => {
    return 'Al eliminar este sector se eliminarán TODOS los consultorios asociados y sus horarios asignados.'
}

const handleCreate = () => {
    navigateTo(ROUTE_NAMES.ADMIN.CREATE_FLOOR)
}

const handleEdit = (floor) => {
    navigateTo(ROUTE_NAMES.ADMIN.EDIT_FLOOR(floor.id))
}

const handleDelete = async (floor) => {
    try {
        await deleteFloor(floor.id)
        showSuccess('Sector eliminado correctamente')
        await fetchFloors()
    } catch (err) {
        showError('Error al eliminar el sector')
        console.error('Error deleting floor:', err)
    }
}
</script>
