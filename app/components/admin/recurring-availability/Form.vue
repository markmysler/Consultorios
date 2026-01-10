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
            <label for="room_id" class="block text-sm font-medium text-gray-700 mb-2">
                Consultorio
            </label>
            <select
                id="room_id"
                v-model="formData.room_id"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
                <option value="" disabled>Seleccione un consultorio</option>
                <option v-for="room in rooms" :key="room.id" :value="room.id">
                    {{ room.name }}
                </option>
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Días de la Semana
            </label>
            <div class="space-y-2">
                <label v-for="day in daysOfWeek" :key="day.value" class="flex items-center">
                    <input
                        type="checkbox"
                        :value="day.value"
                        v-model="selectedDays"
                        class="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span>{{ day.label }}</span>
                </label>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="start_time" class="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Inicio
                </label>
                <input
                    id="start_time"
                    v-model="formData.start_time"
                    type="time"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div>
                <label for="end_time" class="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Fin
                </label>
                <input
                    id="end_time"
                    v-model="formData.end_time"
                    type="time"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>
        </div>

        <div>
            <label for="timezone" class="block text-sm font-medium text-gray-700 mb-2">
                Zona Horaria
            </label>
            <select
                id="timezone"
                v-model="formData.timezone"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
                <option value="America/Argentina/Buenos_Aires">Argentina (Buenos Aires)</option>
                <option value="America/Argentina/Cordoba">Argentina (Córdoba)</option>
                <option value="America/Argentina/Mendoza">Argentina (Mendoza)</option>
            </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="valid_from" class="block text-sm font-medium text-gray-700 mb-2">
                    Válido Desde
                </label>
                <input
                    id="valid_from"
                    v-model="formData.valid_from"
                    type="date"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div>
                <label for="valid_to" class="block text-sm font-medium text-gray-700 mb-2">
                    Válido Hasta (Opcional)
                </label>
                <input
                    id="valid_to"
                    v-model="formData.valid_to"
                    type="date"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>
        </div>

        <div class="flex gap-4 justify-end pt-4">
            <ButtonSecondary type="button" @click="$emit('cancel')">
                Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit">
                {{ isEditing ? 'Actualizar' : 'Crear' }} Horario
            </ButtonPrimary>
        </div>
    </form>
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

const { doctors, fetchDoctors } = useDoctors()
const { rooms, fetchRooms } = useRooms()

const daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' }
]

const selectedDays = ref([])

const formData = reactive({
    doctor_id: props.initialData?.doctor_id || '',
    room_id: props.initialData?.room_id || '',
    days_of_week: props.initialData?.days_of_week || 0,
    start_time: props.initialData?.start_time || '',
    end_time: props.initialData?.end_time || '',
    timezone: props.initialData?.timezone || 'America/Argentina/Buenos_Aires',
    valid_from: props.initialData?.valid_from ? new Date(props.initialData.valid_from).toISOString().split('T')[0] : '',
    valid_to: props.initialData?.valid_to ? new Date(props.initialData.valid_to).toISOString().split('T')[0] : ''
})

const initializeSelectedDays = () => {
    if (props.initialData?.days_of_week) {
        selectedDays.value = []
        for (let i = 0; i < 7; i++) {
            if (props.initialData.days_of_week & (1 << i)) {
                selectedDays.value.push(i)
            }
        }
    }
}

watch(() => props.initialData, (newData) => {
    if (newData) {
        formData.doctor_id = newData.doctor_id || ''
        formData.room_id = newData.room_id || ''
        formData.days_of_week = newData.days_of_week || 0
        formData.start_time = newData.start_time || ''
        formData.end_time = newData.end_time || ''
        formData.timezone = newData.timezone || 'America/Argentina/Buenos_Aires'
        formData.valid_from = newData.valid_from ? new Date(newData.valid_from).toISOString().split('T')[0] : ''
        formData.valid_to = newData.valid_to ? new Date(newData.valid_to).toISOString().split('T')[0] : ''
        initializeSelectedDays()
    }
}, { deep: true })

onMounted(async () => {
    await Promise.all([fetchDoctors(), fetchRooms()])
    initializeSelectedDays()
})

const handleSubmit = () => {
    let daysBitmask = 0
    selectedDays.value.forEach(day => {
        daysBitmask |= (1 << day)
    })

    emit('submit', {
        ...formData,
        days_of_week: daysBitmask
    })
}
</script>
