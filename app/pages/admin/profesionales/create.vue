<template>
    <DefaultSection>
        <HeadingH1>Crear Profesional</HeadingH1>

        <DoctorForm @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useDoctors } from '~/composables/useDoctors.js'
import DoctorForm from '~/components/admin/doctor/Form.vue'

const { createDoctor } = useDoctors()
const { success: showSuccess, error: showError } = useNotification()

const handleSubmit = async (doctorData) => {
    try {
        await createDoctor(doctorData)
        showSuccess('Profesional creado correctamente')
        navigateTo(ROUTE_NAMES.ADMIN.PROFESSIONALS)
    } catch (err) {
        console.error('Error creating doctor:', err)
        showError('Error al crear el profesional: ' + err.message, {
            title: 'Error',
            duration: 5000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ADMIN.PROFESSIONALS)
}
</script>
