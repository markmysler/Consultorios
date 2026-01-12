<template>
    <DefaultSection>
        <HeadingH2>Editar Horario</HeadingH2>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <RecurringAvailabilityForm v-else :is-editing="true" :initial-data="currentRecurringAvailability" @submit="handleSubmit"
            @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRecurringAvailability } from '~/composables/useRecurringAvailability.js'
import RecurringAvailabilityForm from '~/components/admin/recurring-availability/Form.vue'

definePageMeta({
    middleware: 'admin'
})

const route = useRoute()
const { currentRecurringAvailability, loading, fetchRecurringAvailabilityById, updateRecurringAvailability, checkForOverlap } = useRecurringAvailability()
const { success: showSuccess, error: showError } = useNotification()

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchRecurringAvailabilityById(id)
    } catch (err) {
        showError('Error al cargar el horario')
        console.error('Error loading recurring availability:', err)
        navigateTo(ROUTE_NAMES.ADMIN.SCHEDULES)
    }
})

const handleSubmit = async (availabilityData) => {
    try {
        const id = route.params.id
        
        const { hasOverlap, overlaps } = await checkForOverlap(
            availabilityData.room_id,
            availabilityData.days_of_week,
            availabilityData.start_time,
            availabilityData.end_time,
            id
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
        
        await updateRecurringAvailability(id, availabilityData)
        showSuccess('Horario actualizado correctamente')
        navigateTo(ROUTE_NAMES.ADMIN.SCHEDULES)
    } catch (err) {
        console.error('Error updating recurring availability:', err)
        showError('Error al actualizar el horario: ' + err.message, {
            title: 'Error',
            duration: 5000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ADMIN.SCHEDULES)
}
</script>
