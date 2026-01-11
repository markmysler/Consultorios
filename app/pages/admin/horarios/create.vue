<template>
    <DefaultSection>
        <HeadingH2>Crear Horario</HeadingH2>

        <RecurringAvailabilityForm @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRecurringAvailability } from '~/composables/useRecurringAvailability.js'
import RecurringAvailabilityForm from '~/components/admin/recurring-availability/Form.vue'

const { createRecurringAvailability } = useRecurringAvailability()
const { success: showSuccess, error: showError } = useNotification()

const handleSubmit = async (availabilityData) => {
    try {
        await createRecurringAvailability(availabilityData)
        showSuccess('Horario creado correctamente')
        navigateTo(ROUTE_NAMES.ADMIN.SCHEDULES)
    } catch (err) {
        console.error('Error creating recurring availability:', err)
        showError('Error al crear el horario: ' + err.message, {
            title: 'Error',
            duration: 5000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ADMIN.SCHEDULES)
}
</script>
