<template>
    <DefaultSection>
        <HeadingH2>Horarios</HeadingH2>
        <ButtonPrimary @click="handleCreate" class="flex justify-center items-center"> 
            <Icon name="tabler:plus" class="w-5 h-5 mr-2" />
            Nuevo Horario
        </ButtonPrimary>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="recurringAvailabilities.length === 0" class="text-center py-6">
            <Icon name="tabler:clock" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay horarios disponibles</p>
        </div>

        <TableLayout v-else :data="enrichedAvailabilities" :columns="tabla.columns"
            :empty-state-text="`No hay horarios creados`" table-name="horarios" :show-actions="true"
            :show-delete="true" @edit="handleEdit" @delete="handleDelete">
            <template #cell-days_of_week="{ value }">
                {{ formatDays(value) }}
            </template>
        </TableLayout>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRecurringAvailability } from '~/composables/useRecurringAvailability.js'

definePageMeta({
    middleware: 'admin'
})

const { recurringAvailabilities, loading, fetchRecurringAvailabilities, deleteRecurringAvailability } = useRecurringAvailability()
const { success: showSuccess, error: showError } = useNotification()

const tabla = {
    columns: [
        {
            key: 'id',
            label: 'ID',
        },
        {
            key: 'recurring_name',
            label: 'Nombre de Agenda',
        },
        {
            key: 'doctors.fullname',
            label: 'Profesional',
        },
        {
            key: 'rooms.name',
            label: 'Consultorio',
        },
        {
            key: 'days_of_week',
            label: 'Días',
        },
        {
            key: 'start_time',
            label: 'Hora Inicio',
        },
        {
            key: 'end_time',
            label: 'Hora Fin',
        },
        {
            key: 'valid_to',
            label: 'Válido hasta',
        }
    ]
}

const daysMap = {
    1: 'Lun',
    2: 'Mar',
    3: 'Mié',
    4: 'Jue',
    5: 'Vie',
    6: 'Sáb',
    7: 'Dom'
}

const formatDays = (daysArray) => {
    if (!Array.isArray(daysArray) || daysArray.length === 0) return '-'
    return daysArray
        .sort((a, b) => a - b)
        .map(day => daysMap[day] || day)
        .join(', ')
}

const enrichedAvailabilities = computed(() => {
    return recurringAvailabilities.value.map(availability => {
        const doctorName = availability.doctors?.fullname || 'Profesional'
        const roomName = availability.rooms?.name || 'Consultorio'
        const days = formatDays(availability.days_of_week)
        return {
            ...availability,
            name: `${doctorName} - ${roomName} (${days})`
        }
    })
})

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
        await fetchRecurringAvailabilities()
    } catch (err) {
        showError('Error al eliminar el horario')
        console.error('Error deleting recurring availability:', err)
    }
}
</script>
