<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormSelect
                v-model="formData.doctor_id"
                label="Profesional"
                placeholder="Seleccione un profesional"
                id="doctor_id"
                :options="doctorOptions"
                :loading="doctorsLoading"
                required
                :error="errors.doctor_id"
            />

            <FormTextField
                v-model="formData.leave_type"
                label="Tipo de Licencia (Opcional)"
                placeholder="Escriba el tipo de licencia"
                id="leave_type"
                :error="errors.leave_type"
            />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormDateField
                v-model="formData.start_at"
                label="Fecha de Inicio"
                id="start_at"
                required
                :error="errors.start_at"
            />

            <FormDateField
                v-model="formData.end_at"
                label="Fecha de Fin"
                id="end_at"
                required
                :error="errors.end_at"
            />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 lg:gap-8 mt-3">
            <ButtonSecondary type="button" @click="$emit('cancel')">
                Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit">
                {{ isEditing ? 'Actualizar' : 'Crear' }} Licencia
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
import { useDoctors } from '~/composables/useDoctors.js'

const props = defineProps({
    isEditing: {
        type: Boolean,
        default: false
    },
    initialData: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['submit', 'cancel'])

const { doctors, loading: doctorsLoading, fetchDoctors } = useDoctors()

const formData = reactive({
    doctor_id: props.initialData?.doctor_id || '',
    start_at: props.initialData?.start_at ? new Date(props.initialData.start_at).toISOString().split('T')[0] : '',
    end_at: props.initialData?.end_at ? new Date(props.initialData.end_at).toISOString().split('T')[0] : '',
    leave_type: props.initialData?.leave_type || ''
})

const errors = reactive({
    doctor_id: '',
    start_at: '',
    end_at: '',
    leave_type: ''
})

const doctorOptions = computed(() => {
    return doctors.value.map(doctor => ({
        value: doctor.id,
        label: doctor.fullname
    }))
})

watch(() => props.initialData, (newData) => {
    if (newData) {
        formData.doctor_id = newData.doctor_id || ''
        formData.start_at = newData.start_at ? new Date(newData.start_at).toISOString().split('T')[0] : ''
        formData.end_at = newData.end_at ? new Date(newData.end_at).toISOString().split('T')[0] : ''
        formData.leave_type = newData.leave_type || ''
    }
}, { deep: true })

onMounted(async () => {
    await fetchDoctors()
})

const handleSubmit = () => {
    emit('submit', { ...formData })
}
</script>
