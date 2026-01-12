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
        const supabase = useSupabaseClient()

        const { cuil, fullname, shift, specializations, subspecializations } = doctorData
        await updateDoctor(id, { cuil, fullname, shift })

        if (specializations !== undefined) {
            await supabase
                .from('doctor_specializations')
                .delete()
                .eq('doctor_id', id)

            if (specializations.length > 0) {
                const specializationsData = specializations.map(specId => ({
                    doctor_id: id,
                    specialization_id: specId
                }))

                await supabase
                    .from('doctor_specializations')
                    .insert(specializationsData)
            }
        }

        if (subspecializations !== undefined) {
            await supabase
                .from('doctor_sub_specializations')
                .delete()
                .eq('doctor_id', id)

            if (subspecializations.length > 0) {
                const subspecializationsData = subspecializations.map(subSpecId => ({
                    doctor_id: id,
                    sub_specialization_id: subSpecId
                }))

                await supabase
                    .from('doctor_sub_specializations')
                    .insert(subspecializationsData)
            }
        }

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
