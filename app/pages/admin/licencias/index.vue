<template>
    <DefaultSection>
        <HeadingH1>Licencias</HeadingH1>
        <ButtonPrimary @click="handleCreate">
            <Icon name="tabler:plus" class="w-5 h-5 mr-2" />
            Nueva Licencia
        </ButtonPrimary>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="leaveRequests.length === 0" class="text-center py-12">
            <Icon name="tabler:certificate" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay licencias disponibles</p>
        </div>

        <TableLayout v-else :data="leaveRequests" :columns="tabla.columns"
            :empty-state-text="`No hay licencias creadas`" table-name="licencias" :show-actions="true"
            :show-delete="true" @edit="handleEdit" @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useLeaveRequests } from '~/composables/useLeaveRequests.js'

const { leaveRequests, loading, fetchLeaveRequests, deleteLeaveRequest } = useLeaveRequests()
const { success: showSuccess, error: showError } = useNotification()

const tabla = {
    columns: [
        {
            key: 'doctor.nombre',
            label: 'Profesional',
        },
        {
            key: 'fecha_inicio',
            label: 'Fecha Inicio',
            type: 'date'
        },
        {
            key: 'fecha_fin',
            label: 'Fecha Fin',
            type: 'date'
        },
        {
            key: 'motivo',
            label: 'Motivo',
        }
    ]
}

onMounted(async () => {
    try {
        await fetchLeaveRequests()
    } catch (err) {
        console.error('Error loading leave requests:', err)
    }
})

const handleCreate = () => {
    navigateTo(ROUTE_NAMES.ADMIN.CREATE_LICENSE)
}

const handleEdit = (leaveRequest) => {
    navigateTo(ROUTE_NAMES.ADMIN.EDIT_LICENSE(leaveRequest.id))
}

const handleDelete = async (leaveRequest) => {
    try {
        await deleteLeaveRequest(leaveRequest.id)
        showSuccess('Licencia eliminada correctamente')
    } catch (err) {
        showError('Error al eliminar la licencia')
        console.error('Error deleting leave request:', err)
    }
}
</script>
