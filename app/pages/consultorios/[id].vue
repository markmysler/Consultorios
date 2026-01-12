<template>
    <DefaultSection>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="currentRoom" class="w-full max-w-2xl space-y-6">
            <div class="flex flex-col gap-1 text-center">
                <HeadingH2>Consultorio {{ currentRoom.name }}</HeadingH2>
                <p v-if="currentFloor" class="lg:text-xl text-primary font-bold">
                    Sector {{ currentFloor.name }}
                </p>
            </div>

            <FormFieldsContainer>
                <FormDateField v-model="selectedDate" label="Seleccione una fecha" id="date" />
                <FormSelect v-model="selectedTime" label="Seleccione un horario" :options="timeOptions"
                    placeholder="Seleccione horario..." />
            </FormFieldsContainer>

            <div v-if="scheduleLoading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>

            <div v-else class="space-y-3">
                <div v-if="filteredSchedule.length === 0" class="text-center py-8 text-gray-dark italic">
                    No hay horarios asignados para esta fecha y hora
                </div>

                <div v-else class="flex flex-col gap-5">
                    <div v-for="slot in filteredSchedule" :key="slot.id"
                        class="w-full bg-gray-dark rounded-md shadow-md shadow-black/10 overflow-hidden">
                        <div v-if="slot.available" class="flex text-xs lg:text-base text-success font-bold">
                            <span
                                class="min-w-[8.25rem] md:min-w-52 flex items-center gap-2 whitespace-nowrap flex-shrink-0 bg-success rounded-br-md text-center text-primary py-2 px-2.5 lg:px-4">
                                <p class="w-full">LIBRE</p>
                            </span>
                            <span class="flex-1 py-2 px-3 lg:px-5 whitespace-nowrap text-primary font-bold overflow-hidden text-ellipsis">{{
                                slot.time }}</span>
                        </div>

                        <div v-else>
                            <div class="flex text-xs lg:text-base text-primary font-bold">
                                <span
                                    class="min-w-[8.25rem] md:min-w-52 flex-shrink-0 bg-secondary rounded-br-md text-center py-2 px-2.5 lg:px-4 whitespace-nowrap">{{
                                        slot.doctorName }}</span>
                                <span
                                    class="flex-1 py-2 px-3 lg:px-5 whitespace-nowrap overflow-hidden text-ellipsis">{{
                                        slot.time }}</span>
                            </div>
                            <div class="py-2 px-3 lg:px-5">
                                <p class="text-xs lg:text-base text-primary">
                                    Nombre de la agenda: "{{ slot.agendaName }}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-12">
            <Icon name="tabler:door-off" class="w-16 h-16 mx-auto text-gray-dark" />
            <p class="text-dark text-lg mt-4">Consultorio no encontrado</p>
        </div>
    </DefaultSection>
</template>

<script setup>
import { useRooms } from '~/composables/useRooms.js'
import { useFloors } from '~/composables/useFloors.js'
import { useRoomSchedule } from '~/composables/useRoomSchedule.js'

const route = useRoute()
const { currentRoom, loading, fetchRoomById } = useRooms()
const { currentFloor, fetchFloorById } = useFloors()
const { getWeeklySchedule } = useRoomSchedule()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedTime = ref(null)
const weeklySchedule = ref({})
const daySchedule = ref([])
const scheduleLoading = ref(false)

// Convert JavaScript day (0=Sunday) to ISO day (1=Monday, 7=Sunday)
const jsToIsoDay = (jsDay) => {
    return jsDay === 0 ? 7 : jsDay
}

const dayNames = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
}

// Generate time options in 30-minute intervals from 07:00 to 20:00
const timeOptions = computed(() => {
    const options = []
    for (let hour = 7; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            if (hour === 20 && minute > 0) break // Stop at 20:00
            const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
            options.push({
                label: `${timeValue}hs`,
                value: timeValue
            })
        }
    }
    return options
})

// Helper to convert time to minutes
const timeToMinutes = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number)
    return hour * 60 + minute
}

// Helper to convert minutes to time string
const minutesToTime = (minutes) => {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

// Helper to format time from HH:MM:SS to HH:MM
const formatTime = (timeStr) => {
    if (!timeStr) return timeStr
    return timeStr.substring(0, 5) // Takes only HH:MM
}

const updateDaySchedule = async (date) => {
    // Parse date in local timezone to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number)
    const jsDay = new Date(year, month - 1, day).getDay()
    const isoDay = jsToIsoDay(jsDay) // Convert to 1-7 system
    const dayName = dayNames[isoDay]
    const schedule = weeklySchedule.value[dayName] || []

    // Sort schedule by start time
    const sortedSchedule = [...schedule].sort((a, b) =>
        timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
    )

    const allSlots = []
    const dayStart = 7 * 60 // 07:00
    const dayEnd = 20 * 60 // 20:00
    let currentTime = dayStart

    // If no schedule, entire day is free
    if (sortedSchedule.length === 0) {
        allSlots.push({
            id: 'free-07:00-20:00',
            doctorName: null,
            time: '07:00hs - 20:00hs',
            agendaName: null,
            available: true,
            start_time: '07:00',
            end_time: '20:00'
        })
    } else {
        // Process each scheduled slot and gaps between them
        for (const slot of sortedSchedule) {
            const slotStart = timeToMinutes(slot.start_time)
            const slotEnd = timeToMinutes(slot.end_time)

            // Add free slot before this scheduled slot if there's a gap
            if (currentTime < slotStart) {
                const freeStart = minutesToTime(currentTime)
                const freeEnd = minutesToTime(slotStart)
                allSlots.push({
                    id: `free-${freeStart}-${freeEnd}`,
                    doctorName: null,
                    time: `${freeStart}hs - ${freeEnd}hs`,
                    agendaName: null,
                    available: true,
                    start_time: freeStart,
                    end_time: freeEnd
                })
            }

            // Add the scheduled slot
            allSlots.push({
                id: `${slot.start_time}-${slot.end_time}`,
                doctorName: slot.doctor_name,
                time: `${formatTime(slot.start_time)}hs - ${formatTime(slot.end_time)}hs`,
                agendaName: slot.doctor_name,
                doctor_cuil: slot.doctor_cuil,
                available: false,
                start_time: slot.start_time,
                end_time: slot.end_time
            })

            currentTime = slotEnd
        }

        // Add free slot at the end if there's time remaining
        if (currentTime < dayEnd) {
            const freeStart = minutesToTime(currentTime)
            const freeEnd = minutesToTime(dayEnd)
            allSlots.push({
                id: `free-${freeStart}-${freeEnd}`,
                doctorName: null,
                time: `${freeStart}hs - ${freeEnd}hs`,
                agendaName: null,
                available: true,
                start_time: freeStart,
                end_time: freeEnd
            })
        }
    }

    daySchedule.value = allSlots
}

const filteredSchedule = computed(() => {
    if (!selectedTime.value) {
        return daySchedule.value
    }

    // Filter slots that contain the selected time
    return daySchedule.value.filter(slot => {
        const [startHour, startMinute] = slot.start_time.split(':').map(Number)
        const [endHour, endMinute] = slot.end_time.split(':').map(Number)
        const [selectedHour, selectedMinute] = selectedTime.value.split(':').map(Number)

        const startMinutes = startHour * 60 + startMinute
        const endMinutes = endHour * 60 + endMinute
        const selectedMinutes = selectedHour * 60 + selectedMinute

        return selectedMinutes >= startMinutes && selectedMinutes < endMinutes
    })
})

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchRoomById(id)

        // Cargar el piso asociado
        if (currentRoom.value?.floor_id) {
            await fetchFloorById(currentRoom.value.floor_id)
        }

        // Cargar agenda del consultorio
        scheduleLoading.value = true
        weeklySchedule.value = await getWeeklySchedule(id)
        await updateDaySchedule(selectedDate.value)
        scheduleLoading.value = false
    } catch (err) {
        console.error('Error loading room:', err)
        scheduleLoading.value = false
    }
})

// Watch selectedDate and selectedTime to update the schedule
watch([selectedDate, selectedTime], async ([newDate]) => {
    scheduleLoading.value = true
    await updateDaySchedule(newDate)
    scheduleLoading.value = false
})
</script>