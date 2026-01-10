<template>
    <DefaultSection>
        <HeadingH1>Pisos</HeadingH1>
        <ButtonPrimary @click="handleCreate">
            <Icon name="tabler:plus" class="w-5 h-5 mr-2" />
            Nuevo Piso
        </ButtonPrimary>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="floors.length === 0" class="text-center py-12">
            <Icon name="tabler:building" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay pisos disponibles</p>
        </div>

        <TableLayout v-else :data="floors" :columns="tabla.columns"
            :empty-state-text="`No hay pisos creados`" table-name="pisos" :show-actions="true"
            :show-delete="true" @edit="handleEdit" @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useFloors } from '~/composables/useFloors.js'

const { floors, loading, fetchFloors, deleteFloor } = useFloors()
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

const handleCreate = () => {
    navigateTo(ROUTE_NAMES.ADMIN.CREATE_FLOOR)
}

const handleEdit = (floor) => {
    navigateTo(ROUTE_NAMES.ADMIN.EDIT_FLOOR(floor.id))
}

const handleDelete = async (floor) => {
    try {
        await deleteFloor(floor.id)
        showSuccess('Piso eliminado correctamente')
    } catch (err) {
        showError('Error al eliminar el piso')
        console.error('Error deleting floor:', err)
    }
}
</script>
