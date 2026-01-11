<template>
    <div v-if="isOpen" class="flex items-center justify-center fixed inset-0 z-50 bg-black bg-opacity-50">
        <div
            class="w-full max-w-72 lg:max-w-4xl flex flex-col items-center gap-6 relative bg-light rounded-[20px] shadow-1 p-5 lg:p-14">
            <button @click="$emit('cancel')" class="flex justify-center items-center absolute top-4 right-4">
                <Icon name="tabler:plus" class="w-5 lg:w-7 h-5 lg:h-7 text-dark rotate-45" />
            </button>
            <HeadingH2 class="text-center mt-4">¿Estás seguro que queres eliminar "{{ itemName }}" de {{ tableName }}?
            </HeadingH2>
            <div class="flex flex-col gap-3 text-center">
                <p class="font-light lg:text-xl">Esta acción es irreversible</p>
                <p v-if="warningMessage" class="font-medium lg:text-xl text-error">
                    ⚠️ {{ warningMessage }}
                </p>
            </div>
            <div class="w-full flex justify-center flex-wrap items-center gap-5">
                <ButtonSecondary @click="$emit('cancel')" class="!w-max">
                    Cancelar
                </ButtonSecondary>

                <ButtonPrimary @click="$emit('confirm')" class="!w-max">
                    Eliminar
                </ButtonPrimary>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ButtonPrimary } from '#components';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    itemName: {
        type: [String, Number],
        default: ''
    },
    tableName: {
        type: String,
        default: ''
    },
    warningMessage: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['cancel', 'confirm'])
</script>
