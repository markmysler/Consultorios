<template>
    <DefaultSection>
        <HeadingH2>Editar Licencia</HeadingH2>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <LeaveRequestForm v-else :is-editing="true" :initial-data="currentLeaveRequest" @submit="handleSubmit"
            @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useLeaveRequests } from '~/composables/useLeaveRequests.js'
import LeaveRequestForm from '~/components/admin/leave-request/Form.vue'

definePageMeta({
    middleware: 'admin'
})

const route = useRoute()
const { currentLeaveRequest, loading, fetchLeaveRequestById, updateLeaveRequest } = useLeaveRequests()
const { success: showSuccess, error: showError } = useNotification()

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchLeaveRequestById(id)
    } catch (err) {
        showError('Error al cargar la licencia')
        console.error('Error loading leave request:', err)
        navigateTo(ROUTE_NAMES.ADMIN.LICENSES)
    }
})

const handleSubmit = async (leaveRequestData) => {
    try {
        const id = route.params.id
        await updateLeaveRequest(id, leaveRequestData)
        showSuccess('Licencia actualizada correctamente')
        navigateTo(ROUTE_NAMES.ADMIN.LICENSES)
    } catch (err) {
        console.error('Error updating leave request:', err)
        showError('Error al actualizar la licencia: ' + err.message, {
            title: 'Error',
            duration: 5000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ADMIN.LICENSES)
}
</script>
