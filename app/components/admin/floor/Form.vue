<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Piso
            </label>
            <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ingrese el nombre del piso (ej: Planta Baja, Piso 1)"
            />
        </div>

        <div>
            <label for="display_order" class="block text-sm font-medium text-gray-700 mb-2">
                Orden de Visualización
            </label>
            <input
                id="display_order"
                v-model.number="formData.display_order"
                type="number"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ingrese el orden (ej: 0, 1, 2)"
            />
        </div>

        <div class="flex gap-4 justify-end pt-4">
            <ButtonSecondary type="button" @click="$emit('cancel')">
                Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit">
                {{ isEditing ? 'Actualizar' : 'Crear' }} Piso
            </ButtonPrimary>
        </div>
    </form>
</template>

<script setup>
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

const formData = reactive({
    name: props.initialData?.name || '',
    display_order: props.initialData?.display_order || 0
})

watch(() => props.initialData, (newData) => {
    if (newData) {
        formData.name = newData.name || ''
        formData.display_order = newData.display_order || 0
    }
}, { deep: true })

const handleSubmit = () => {
    emit('submit', { ...formData })
}
</script>
