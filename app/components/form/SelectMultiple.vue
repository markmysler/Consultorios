<template>
    <div class="w-full flex flex-col gap-2">
        <p v-if="label" class="text-dark font-light lg:text-xl">
            {{ label }}
            <span v-if="required" class="text-primary ml-1">*</span>
        </p>

        <div class="relative">
            <div @click="toggleDropdown"
                class="flex items-center justify-between bg-light border border-dark rounded-[5px] lg:text-xl font-light text-dark cursor-pointer outline-none py-3 px-[0.875rem] min-h-[3rem]">
                <div v-if="selectedOptions.length > 0" class="flex flex-wrap gap-2 flex-1">
                    <span v-for="option in selectedOptions" :key="option.value"
                        class="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                        {{ option.label }}
                        <Icon @click.stop="removeOption(option.value)" name="tabler:x"
                            class="w-4 h-4 hover:text-primary-dark cursor-pointer" />
                    </span>
                </div>
                <span v-else class="text-gray-dark">{{ placeholder }}</span>
                <div class="flex items-center gap-2 ml-2">
                    <Icon v-if="clearable && selectedOptions.length > 0" @click.stop="clearSelection" name="tabler:x"
                        class="w-5 h-5 hover:text-primary transition-colors" />
                    <Icon name="tabler:chevron-down" class="w-5 h-5"
                        :class="['transition-transform', isOpen ? 'rotate-180' : '']" />
                </div>
            </div>

            <div v-if="isOpen"
                class="max-h-60 absolute top-full left-0 right-0 z-50 bg-light border border-dark rounded-[5px] overflow-hidden mt-1">
                <div class="border-b border-gray-200">
                    <label :for="`buscar-${id}`" class="sr-only">Buscar</label>
                    <input :id="`buscar-${id}`" v-model="searchQuery" type="text" placeholder="Buscar..."
                        class="w-full bg-light rounded px-[0.875rem] py-3 text-sm outline-none" @click.stop />
                </div>

                <div class="max-h-48 overflow-y-auto">
                    <div v-if="loading" class="p-3 text-center text-gray-dark">
                        Cargando...
                    </div>
                    <div v-else-if="filteredOptions.length === 0" class="p-3 text-center text-gray-500">
                        No se encontraron resultados
                    </div>
                    <div v-else v-for="option in filteredOptions" :key="option.value" @click="toggleOption(option)"
                        class="hover:bg-gray-light cursor-pointer transition-colors duration-200 p-3 flex items-center gap-2">
                        <Icon :name="isSelected(option.value) ? 'tabler:checkbox' : 'tabler:square'"
                            class="w-5 h-5"
                            :class="isSelected(option.value) ? 'text-primary' : 'text-gray-dark'" />
                        {{ option.label }}
                    </div>
                </div>
            </div>
        </div>

        <FormError v-if="error && showError">{{ error }}</FormError>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: 'Seleccionar...'
    },
    options: {
        type: Array,
        default: () => []
    },
    error: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    clearable: {
        type: Boolean,
        default: true
    },
    id: {
        type: String,
        default: () => `select-multiple-${Math.random().toString(36).substr(2, 9)}`
    }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const showError = ref(false)

const selectedOptions = computed(() => {
    if (!props.modelValue || props.modelValue.length === 0) return []
    return props.options.filter(option =>
        props.modelValue.includes(option.value)
    )
})

const filteredOptions = computed(() => {
    if (!searchQuery.value) return props.options

    return props.options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const isSelected = (value) => {
    return props.modelValue.includes(value)
}

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        searchQuery.value = ''
    }
}

const toggleOption = (option) => {
    const newValue = [...props.modelValue]
    const index = newValue.indexOf(option.value)

    if (index > -1) {
        newValue.splice(index, 1)
    } else {
        newValue.push(option.value)
    }

    emit('update:modelValue', newValue)

    if (showError.value) {
        showError.value = false
    }
}

const removeOption = (value) => {
    const newValue = props.modelValue.filter(v => v !== value)
    emit('update:modelValue', newValue)

    if (showError.value) {
        showError.value = false
    }
}

const clearSelection = () => {
    emit('update:modelValue', [])
    if (showError.value) {
        showError.value = false
    }
}

const closeDropdown = (event) => {
    if (!event.target.closest('.relative')) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown)
})

watchEffect(() => {
    if (props.error) {
        showError.value = true
    }
})
</script>
