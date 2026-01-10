<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
            <label for="cull" class="block text-sm font-medium text-gray-700 mb-2">
                CUIL
            </label>
            <input
                id="cull"
                v-model="formData.cull"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ingrese el CUIL"
            />
        </div>

        <div>
            <label for="fullname" class="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
            </label>
            <input
                id="fullname"
                v-model="formData.fullname"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ingrese el nombre completo"
            />
        </div>

        <div class="flex gap-4 justify-end pt-4">
            <ButtonSecondary type="button" @click="$emit('cancel')">
                Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit">
                {{ isEditing ? 'Actualizar' : 'Crear' }} Profesional
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
    cull: props.initialData?.cull || '',
    fullname: props.initialData?.fullname || ''
})

watch(() => props.initialData, (newData) => {
    if (newData) {
        formData.cull = newData.cull || ''
        formData.fullname = newData.fullname || ''
    }
}, { deep: true })

const handleSubmit = () => {
    emit('submit', { ...formData })
}
</script>
