<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Consultorio
            </label>
            <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ingrese el nombre del consultorio"
            />
        </div>

        <div>
            <label for="floor_id" class="block text-sm font-medium text-gray-700 mb-2">
                Piso
            </label>
            <select
                id="floor_id"
                v-model="formData.floor_id"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
                <option value="" disabled>Seleccione un piso</option>
                <option v-for="floor in floors" :key="floor.id" :value="floor.id">
                    {{ floor.name }}
                </option>
            </select>
        </div>

        <div class="flex gap-4 justify-end pt-4">
            <ButtonSecondary type="button" @click="$emit('cancel')">
                Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit">
                {{ isEditing ? 'Actualizar' : 'Crear' }} Consultorio
            </ButtonPrimary>
        </div>
    </form>
</template>

<script setup>
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

const { floors, fetchFloors } = useFloors()

const formData = reactive({
    name: props.initialData?.name || '',
    floor_id: props.initialData?.floor_id || ''
})

watch(() => props.initialData, (newData) => {
    if (newData) {
        formData.name = newData.name || ''
        formData.floor_id = newData.floor_id || ''
    }
}, { deep: true })

onMounted(async () => {
    await fetchFloors()
})

const handleSubmit = () => {
    emit('submit', { ...formData })
}
</script>
