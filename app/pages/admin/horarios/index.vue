<template>
    <DefaultSection>
        <HeadingH1>Horarios</HeadingH1>
        <ButtonPrimary @click="handleCreate">
            <Icon name="tabler:plus" class="w-5 h-5 mr-2" />
            Nuevo Horario
        </ButtonPrimary>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="recurringAvailabilities.length === 0" class="text-center py-12">
            <Icon name="tabler:clock" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay horarios disponibles</p>
        </div>

        <TableLayout v-else :data="recurringAvailabilities" :columns="tabla.columns"
            :empty-state-text="`No hay horarios creados`" table-name="horarios" :show-actions="true"
            :show-delete="true" @edit="handleEdit" @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRecurringAvailability } from '~/composables/useRecurringAvailability.js'

const { recurringAvailabilities, loading, fetchRecurringAvailabilities, deleteRecurringAvailability } = useRecurringAvailability()
const { success: showSuccess, error: showError } = useNotification()

const tabla = {
    columns: [
        {
            key: 'doctor.nombre',
            label: 'Profesional',
        },
        {
            key: 'room.nombre',
            label: 'Consultorio',
        },
        {
            key: 'dia_semana',
            label: 'Día',
        },
        {
            key: 'hora_inicio',
            label: 'Hora Inicio',
            type: 'time'
        },
        {
            key: 'hora_fin',
            label: 'Hora Fin',
            type: 'time'
        }
    ]
}

onMounted(async () => {
    try {
        await fetchRecurringAvailabilities()
    } catch (err) {
        console.error('Error loading recurring availabilities:', err)
    }
})

const handleCreate = () => {
    navigateTo(ROUTE_NAMES.ADMIN.CREATE_SCHEDULE)
}

const handleEdit = (availability) => {
    navigateTo(ROUTE_NAMES.ADMIN.EDIT_SCHEDULE(availability.id))
}

const handleDelete = async (availability) => {
    try {
        await deleteRecurringAvailability(availability.id)
        showSuccess('Horario eliminado correctamente')
    } catch (err) {
        showError('Error al eliminar el horario')
        console.error('Error deleting recurring availability:', err)
    }
}
</script>
