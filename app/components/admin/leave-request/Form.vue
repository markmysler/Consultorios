<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
            <label for="doctor_id" class="block text-sm font-medium text-gray-700 mb-2">
                Profesional
            </label>
            <select
                id="doctor_id"
                v-model="formData.doctor_id"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
                <option value="" disabled>Seleccione un profesional</option>
                <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                    {{ doctor.fullname }}
                </option>
            </select>
        </div>

        <div>
            <label for="start_at" class="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
            </label>
            <input
                id="start_at"
                v-model="formData.start_at"
                type="datetime-local"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
        </div>

        <div>
            <label for="end_at" class="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin
            </label>
            <input
                id="end_at"
                v-model="formData.end_at"
                type="datetime-local"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
        </div>

        <div>
            <label for="leave_type" class="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Licencia
            </label>
            <select
                id="leave_type"
                v-model="formData.leave_type"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
                <option value="" disabled>Seleccione un tipo</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="enfermedad">Enfermedad</option>
                <option value="personal">Personal</option>
                <option value="capacitacion">Capacitación</option>
                <option value="otro">Otro</option>
            </select>
        </div>

        <div class="flex gap-4 justify-end pt-4">
            <ButtonSecondary type="button" @click="$emit('cancel')">
                Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit">
                {{ isEditing ? 'Actualizar' : 'Crear' }} Licencia
            </ButtonPrimary>
        </div>
    </form>
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

const { doctors, fetchDoctors } = useDoctors()

const formData = reactive({
    doctor_id: props.initialData?.doctor_id || '',
    start_at: props.initialData?.start_at ? new Date(props.initialData.start_at).toISOString().slice(0, 16) : '',
    end_at: props.initialData?.end_at ? new Date(props.initialData.end_at).toISOString().slice(0, 16) : '',
    leave_type: props.initialData?.leave_type || ''
})

watch(() => props.initialData, (newData) => {
    if (newData) {
        formData.doctor_id = newData.doctor_id || ''
        formData.start_at = newData.start_at ? new Date(newData.start_at).toISOString().slice(0, 16) : ''
        formData.end_at = newData.end_at ? new Date(newData.end_at).toISOString().slice(0, 16) : ''
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
