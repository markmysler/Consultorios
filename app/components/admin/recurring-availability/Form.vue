<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormSelect v-model="formData.doctor_id" label="Profesional" placeholder="Seleccione un profesional"
                id="doctor_id" :options="doctorOptions" :loading="doctorsLoading" required :error="errors.doctor_id" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormSelect v-model="selectedSectorId" label="Sector" placeholder="Seleccione un sector" id="sector_id"
                :options="sectorOptions" :loading="floorsLoading" required />

            <FormSelect v-model="formData.room_id" label="Consultorio" placeholder="Seleccione un sector primero"
                id="room_id" :options="roomOptions" :loading="roomsLoading" :disabled="!selectedSectorId" required
                :error="errors.room_id" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTimeField v-model="formData.start_time" label="Hora de Inicio" id="start_time" required
                :maxTime="maxStartTime" :error="errors.start_time" />

            <FormTimeField v-model="formData.end_time" label="Hora de Fin" id="end_time" required :minTime="minEndTime"
                :error="errors.end_time" />
        </FormFieldsContainer>

        <FormCheckboxGroupField v-model="selectedDays" label="Días de la Semana" id="days_of_week"
            :options="daysOfWeekOptions" :error="errors.days_of_week" />

        <FormFieldsContainer>
            <FormTextField v-model="formData.recurring_name" label="Nombre de Agenda (Opcional)"
                placeholder="Ej: Consultorio Mañana" id="recurring_name" :error="errors.recurring_name" />

            <FormDateField v-model="formData.valid_to" label="Válido Hasta (Opcional)" id="valid_to"
                :error="errors.valid_to" />
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
import { useFloors } from '~/composables/useFloors.js'

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
const { floors, loading: floorsLoading, fetchFloors } = useFloors()

const selectedSectorId = ref(null)

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

const sectorOptions = computed(() => {
    return floors.value.map(floor => ({
        value: floor.id,
        label: floor.name
    }))
})

const roomOptions = computed(() => {
    if (!selectedSectorId.value) return []
    return rooms.value
        .filter(room => room.floor_id === selectedSectorId.value)
        .map(room => ({
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

const addMinutesToTime = (timeStr, minutes) => {
    if (!timeStr) return null
    const [hours, mins] = timeStr.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
}

const maxStartTime = computed(() => {
    if (!formData.end_time) return null
    return addMinutesToTime(formData.end_time, -1)
})

const minEndTime = computed(() => {
    if (!formData.start_time) return null
    return addMinutesToTime(formData.start_time, 1)
})

watch(() => formData.start_time, (newStartTime) => {
    if (newStartTime && formData.end_time) {
        if (newStartTime >= formData.end_time) {
            formData.end_time = ''
            errors.end_time = ''
        }
    }
})

watch(() => formData.end_time, (newEndTime) => {
    if (newEndTime && formData.start_time) {
        if (formData.start_time >= newEndTime) {
            formData.start_time = ''
            errors.start_time = ''
        }
    }
})

const isInitializing = ref(false)

watch(selectedSectorId, () => {
    if (!isInitializing.value) {
        formData.room_id = null
    }
})

const initializeSelectedDays = () => {
    if (props.initialData?.days_of_week) {
        if (Array.isArray(props.initialData.days_of_week)) {
            selectedDays.value = props.initialData.days_of_week.map(day => day.toString())
        } else {
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
        initializeSectorFromRoom()
    }
}, { deep: true })

const initializeSectorFromRoom = () => {
    if (props.initialData?.room_id && rooms.value.length > 0) {
        const room = rooms.value.find(r => r.id === props.initialData.room_id)
        if (room) {
            isInitializing.value = true
            selectedSectorId.value = room.floor_id
            nextTick(() => {
                isInitializing.value = false
            })
        }
    }
}

onMounted(async () => {
    await Promise.all([fetchDoctors(), fetchRooms(), fetchFloors()])
    initializeSelectedDays()
    initializeSectorFromRoom()
})

const handleSubmit = () => {
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
        errors.start_time = 'La hora de inicio debe ser anterior a la hora de fin'
        errors.end_time = 'La hora de fin debe ser posterior a la hora de inicio'
        return
    }

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
