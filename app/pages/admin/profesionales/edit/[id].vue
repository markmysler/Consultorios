<template>
    <DefaultSection>
        <HeadingH2>Editar Profesional</HeadingH2>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <DoctorForm v-else :is-editing="true" :initial-data="currentDoctor" @submit="handleSubmit"
            @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useDoctors } from '~/composables/useDoctors.js'
import DoctorForm from '~/components/admin/doctor/Form.vue'

definePageMeta({
    middleware: 'admin'
})

const route = useRoute()
const { currentDoctor, loading, fetchDoctorById, updateDoctor } = useDoctors()
const { success: showSuccess, error: showError } = useNotification()

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchDoctorById(id)
    } catch (err) {
        showError('Error al cargar el profesional')
        console.error('Error loading doctor:', err)
        navigateTo(ROUTE_NAMES.ADMIN.PROFESSIONALS)
    }
})

const handleSubmit = async (doctorData) => {
    try {
        const id = route.params.id
        await updateDoctor(id, doctorData)
        showSuccess('Profesional actualizado correctamente')
        navigateTo(ROUTE_NAMES.ADMIN.PROFESSIONALS)
    } catch (err) {
        console.error('Error updating doctor:', err)
        showError('Error al actualizar el profesional: ' + err.message, {
            title: 'Error',
            duration: 5000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ADMIN.PROFESSIONALS)
}
</script>
