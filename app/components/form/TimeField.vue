<template>
    <div class="w-full flex flex-col gap-2">
        <FormLabel :id="id" :required="required" v-if="label">{{ label }}</FormLabel>

        <div class="relative">
            <input
                ref="inputElement"
                :id="inputId"
                type="time"
                :value="modelValue"
                :required="required"
                :min="minTime"
                :max="maxTime"
                @input="handleInput"
                @blur="handleBlur"
                @focus="handleFocus"
                class="w-full bg-light border border-dark rounded-md lg:text-xl font-light text-dark outline-none py-3 px-[0.875rem]
                [&::-webkit-calendar-picker-indicator]:cursor-pointer
                [&::-webkit-calendar-picker-indicator]:opacity-70
                [&::-webkit-calendar-picker-indicator]:hover:opacity-100
                [&::-webkit-calendar-picker-indicator]:transition-opacity
                focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-shadow"
            />
        </div>

        <FormError v-if="error && showError">{{ error }}</FormError>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    error: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        required: true,
    },
    minTime: {
        type: String,
        default: null
    },
    maxTime: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputElement = ref(null)
const showError = ref(false)

const inputId = computed(() => props.id)

const handleInput = (event) => {
    const value = event.target.value
    emit('update:modelValue', value)

    if (showError.value) {
        showError.value = false
    }
}

const handleBlur = (event) => {
    if (props.error) {
        showError.value = true
    }

    if (event.target.value && !isValidTime(event.target.value)) {
        showError.value = true
    }

    emit('blur', event)
}

const handleFocus = (event) => {
    emit('focus', event)
}

const isValidTime = (timeString) => {
    if (!timeString) return true
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)
}

watchEffect(() => {
    if (props.error) {
        showError.value = true
    }
})

const focus = () => {
    if (inputElement.value) {
        inputElement.value.focus()
    }
}

const clear = () => {
    emit('update:modelValue', '')
    showError.value = false
}

defineExpose({
    focus,
    clear
})
</script>