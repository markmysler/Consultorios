<template>
    <DefaultSection>
        <HeadingH2>Crear Licencia</HeadingH2>

        <LeaveRequestForm @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useLeaveRequests } from '~/composables/useLeaveRequests.js'
import LeaveRequestForm from '~/components/admin/leave-request/Form.vue'

definePageMeta({
    middleware: 'admin'
})

const { createLeaveRequest } = useLeaveRequests()
const { success: showSuccess, error: showError } = useNotification()

const handleSubmit = async (leaveRequestData) => {
    try {
        await createLeaveRequest(leaveRequestData)
        showSuccess('Licencia creada correctamente')
        navigateTo(ROUTE_NAMES.ADMIN.LICENSES)
    } catch (err) {
        console.error('Error creating leave request:', err)
        showError('Error al crear la licencia: ' + err.message, {
            title: 'Error',
            duration: 5000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ADMIN.LICENSES)
}
</script>
