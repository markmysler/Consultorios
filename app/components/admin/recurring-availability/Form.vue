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

            <FormSelect
                v-model="formData.room_id"
                label="Consultorio"
                placeholder="Seleccione un consultorio"
                id="room_id"
                :options="roomOptions"
                :loading="roomsLoading"
                required
                :error="errors.room_id"
            />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTimeField
                v-model="formData.start_time"
                label="Hora de Inicio"
                id="start_time"
                required
                :error="errors.start_time"
            />

            <FormTimeField
                v-model="formData.end_time"
                label="Hora de Fin"
                id="end_time"
                required
                :error="errors.end_time"
            />
        </FormFieldsContainer>

        <FormCheckboxGroupField
            v-model="selectedDays"
            label="Días de la Semana"
            id="days_of_week"
            :options="daysOfWeekOptions"
            :error="errors.days_of_week"
        />

        <FormFieldsContainer>
            <FormTextField
                v-model="formData.recurring_name"
                label="Nombre de Agenda (Opcional)"
                placeholder="Ej: Consultorio Mañana"
                id="recurring_name"
                :error="errors.recurring_name"
            />

            <FormDateField
                v-model="formData.valid_to"
                label="Válido Hasta (Opcional)"
                id="valid_to"
                :error="errors.valid_to"
            />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 lg:gap-8 mt-3">
            <ButtonSecondary type="button" @click="$emit('cancel')">
                Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit">
                {{ isEditing ? 'Actualizar' : 'Crear' }} Horario
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
import { useDoctors } from '~/composables/useDoctors.js'
import { useRooms } from '~/composables/useRooms.js'

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
const { rooms, loading: roomsLoading, fetchRooms } = useRooms()

const daysOfWeekOptions = [
    { value: '1', label: 'Lunes' },
    { value: '2', label: 'Martes' },
    { value: '3', label: 'Miércoles' },
    { value: '4', label: 'Jueves' },
    { value: '5', label: 'Viernes' },
    { value: '6', label: 'Sábado' }
]

const doctorOptions = computed(() => {
    return doctors.value.map(doctor => ({
        value: doctor.id,
        label: doctor.fullname
    }))
})

const roomOptions = computed(() => {
    return rooms.value.map(room => ({
        value: room.id,
        label: room.name
    }))
})

const selectedDays = ref([])
const errors = reactive({})

const formData = reactive({
    doctor_id: props.initialData?.doctor_id || null,
    room_id: props.initialData?.room_id || null,
    start_time: props.initialData?.start_time || '',
    end_time: props.initialData?.end_time || '',
    recurring_name: props.initialData?.recurring_name || '',
    valid_to: props.initialData?.valid_to ? new Date(props.initialData.valid_to).toISOString().split('T')[0] : null
})

const initializeSelectedDays = () => {
    if (props.initialData?.days_of_week) {
        // Si days_of_week es un array, convertir a strings
        if (Array.isArray(props.initialData.days_of_week)) {
            selectedDays.value = props.initialData.days_of_week.map(day => day.toString())
        } else {
            // Si es un número (bitmask), convertir a array
            selectedDays.value = []
            for (let i = 0; i < 7; i++) {
                if (props.initialData.days_of_week & (1 << i)) {
                    selectedDays.value.push(i.toString())
                }
            }
        }
    }
}

watch(() => props.initialData, (newData) => {
    if (newData) {
        formData.doctor_id = newData.doctor_id || null
        formData.room_id = newData.room_id || null
        formData.start_time = newData.start_time || ''
        formData.end_time = newData.end_time || ''
        formData.recurring_name = newData.recurring_name || ''
        formData.valid_to = newData.valid_to ? new Date(newData.valid_to).toISOString().split('T')[0] : null
        initializeSelectedDays()
    }
}, { deep: true })

onMounted(async () => {
    await Promise.all([fetchDoctors(), fetchRooms()])
    initializeSelectedDays()
})

const handleSubmit = () => {
    // Convertir los días seleccionados a un array de números
    const daysArray = selectedDays.value.map(day => parseInt(day))

    const today = new Date().toISOString().split('T')[0]

    emit('submit', {
        doctor_id: formData.doctor_id,
        room_id: formData.room_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        recurring_name: formData.recurring_name || null,
        days_of_week: daysArray,
        timezone: 'America/Argentina/Buenos_Aires',
        valid_from: today,
        valid_to: formData.valid_to || null
    })
}
</script>
