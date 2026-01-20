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

definePageMeta({
    middleware: 'admin'
})

const { createRecurringAvailability, checkForOverlap } = useRecurringAvailability()
const { success: showSuccess, error: showError } = useNotification()

const handleSubmit = async (availabilityData) => {
    try {
        const { hasOverlap, overlaps } = await checkForOverlap(
            availabilityData.room_id,
            availabilityData.days_of_week,
            availabilityData.start_time,
            availabilityData.end_time
        )

        if (hasOverlap) {
            const overlapInfo = overlaps[0]
            showError(
                `El consultorio ya está reservado en el horario ${overlapInfo.start_time} - ${overlapInfo.end_time}. Por favor, seleccione otro horario.`,
                {
                    title: 'Consultorio ya reservado',
                    duration: 6000
                }
            )
            return
        }

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
