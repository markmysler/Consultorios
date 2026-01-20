<template>
    <div class="w-full max-w-[100vw]">
        <!-- Search and Download Section -->
        <div class="flex flex-wrap justify-between items-start sm:items-end gap-4 mb-6">
            <!-- Search Box -->
            <div class="w-full sm:w-auto sm:min-w-[300px]">
                <FormTextField
                    id="table-search"
                    v-model="searchQuery"
                    placeholder="Buscar..."
                    type="text"
                    label="Buscar dentro de la tabla"
                />
            </div>

            <!-- Download Section -->
            <div v-if="showDownload && data && data.length > 0" class="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full sm:w-auto">
                <div class="sm:min-w-[180px]">
                    <FormSelect
                        v-model="selectedFormat"
                        :options="formatOptions"
                        placeholder="Formato"
                        label="Descargar como"
                    />
                </div>
                <button
                    @click="handleDownload"
                    class="bg-primary text-light px-5 py-3 lg:py-4 rounded-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 font-light whitespace-nowrap"
                >
                    <Icon name="tabler:download" class="w-5 h-5" />
                    Descargar
                </button>
            </div>
        </div>

        <!-- Table -->
        <div class="w-full overflow-auto">
            <table class="w-full mx-auto">
                <thead>
                    <tr>
                        <th v-for="column in columns" :key="column.key"
                            class="text-center text-dark whitespace-nowrap font-medium p-3">
                            {{ column.label }}
                        </th>
                        <th v-if="showActions" class="text-center text-dark whitespace-nowrap font-medium p-3">
                            Acciones
                        </th>
                    </tr>
                </thead>

            <tbody>
                <tr v-for="(item, index) in paginatedData" :key="getRowKey(item, index)"
                    class="bg-gray-light border-b border-gray-dark last:border-none">
                    <td v-for="column in columns" :key="column.key"
                        class="border-r border-gray-dark text-dark font-light p-3 text-center"
                        style="max-height: 8rem; height: auto; vertical-align: middle;">
                        <div class="max-h-32 overflow-y-auto flex items-center justify-center" style="max-height: 8rem;">
                            <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)"
                                :column="column" :index="index">
                                <TableCellRenderer :value="getNestedValue(item, column.key)" :column="column"
                                    :related-data="relatedData" :item="item" />
                            </slot>
                        </div>
                    </td>

                    <td v-if="showActions" class="font-light whitespace-nowrap p-3">
                        <slot name="row-actions" :item="item" :index="index">
                            <div class="flex justify-center items-center gap-2">
                                <button type="button" @click.prevent.stop="$emit('edit', item, index)" title="Editar">
                                    <Icon name="tabler:edit" class="w-6 h-6 text-terciary" />
                                </button>
                                <button v-if="showDelete" type="button" @click.prevent.stop="openDeleteModal(item, index)"
                                    title="Eliminar">
                                    <Icon name="tabler:trash" class="w-6 h-6 text-primary" />
                                </button>
                            </div>
                        </slot>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="!filteredData || filteredData.length === 0" class="py-12 text-center text-gray-500">
            <slot name="empty">
                <p>{{ searchQuery ? 'No se encontraron resultados' : emptyStateText }}</p>
            </slot>
        </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredData && filteredData.length > 0" class="flex flex-wrap justify-between items-center gap-6 mt-8 pt-6 border-t border-gray-dark">
            <!-- Items per page selector -->
            <div class="flex items-center gap-3">
                <span class="text-dark font-light lg:text-lg">Mostrar:</span>
                <select
                    v-model="itemsPerPage"
                    class="bg-light border border-dark rounded-md text-dark py-2 px-4 lg:text-lg font-light outline-none cursor-pointer transition-all hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                >
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="30">30</option>
                    <option :value="50">50</option>
                </select>
                <span class="text-dark font-light lg:text-lg">
                    {{ paginationInfo }}
                </span>
            </div>

            <!-- Page navigation -->
            <div class="flex items-center gap-2">
                <button
                    @click="goToPage(1)"
                    :disabled="currentPage === 1"
                    class="flex justify-center items-center p-2.5 rounded-md border border-dark text-dark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary hover:border-primary transition-all duration-300"
                    title="Primera página"
                >
                    <Icon name="tabler:chevrons-left" class="w-5 h-5" />
                </button>
                <button
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="flex justify-center items-center p-2.5 rounded-md border border-dark text-dark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary hover:border-primary transition-all duration-300"
                    title="Página anterior"
                >
                    <Icon name="tabler:chevron-left" class="w-5 h-5" />
                </button>

                <!-- Page numbers -->
                <div class="flex items-center gap-1.5">
                    <button
                        v-for="page in visiblePages"
                        :key="page"
                        @click="goToPage(page)"
                        :class="[
                            'min-w-[40px] px-3 py-2 rounded-md font-light transition-all duration-300',
                            currentPage === page
                                ? 'bg-primary text-light shadow-md'
                                : 'border border-dark text-dark hover:bg-secondary hover:border-primary'
                        ]"
                    >
                        {{ page }}
                    </button>
                </div>

                <button
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="flex justify-center items-center p-2.5 rounded-md border border-dark text-dark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary hover:border-primary transition-all duration-300"
                    title="Página siguiente"
                >
                    <Icon name="tabler:chevron-right" class="w-5 h-5" />
                </button>
                <button
                    @click="goToPage(totalPages)"
                    :disabled="currentPage === totalPages"
                    class="flex justify-center items-center p-2.5 rounded-md border border-dark text-dark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary hover:border-primary transition-all duration-300"
                    title="Última página"
                >
                    <Icon name="tabler:chevrons-right" class="w-5 h-5" />
                </button>
            </div>
        </div>

        <ModalDelete :is-open="deleteModal.isOpen" :item-name="deleteModal.itemName" :table-name="deleteModal.tableName"
            :warning-message="deleteModal.warningMessage" @cancel="closeDeleteModal" @confirm="confirmDelete" />
    </div>
</template>


<script setup>
import { useTableDownload } from '~/composables/useTableDownload.js'

const props = defineProps({
    data: {
        type: Array,
        default: () => []
    },
    columns: {
        type: Array,
        required: true
    },
    relatedData: {
        type: Object,
        default: () => ({})
    },
    showActions: {
        type: Boolean,
        default: true
    },
    showDelete: {
        type: Boolean,
        default: true
    },
    emptyStateText: {
        type: String,
        default: 'No hay datos disponibles'
    },
    rowKey: {
        type: String,
        default: 'id'
    },
    tableName: {
        type: String,
        default: 'tabla'
    },
    deleteWarningGetter: {
        type: Function,
        default: null
    },
    showDownload: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['edit', 'delete'])

const { downloadTable } = useTableDownload()
const selectedFormat = ref('csv')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const formatOptions = [
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
    { value: 'tsv', label: 'TSV' }
]

const deleteModal = ref({
    isOpen: false,
    item: null,
    index: null,
    itemName: '',
    tableName: '',
    warningMessage: ''
})

const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

const getRowKey = (item, index) => {
    return getNestedValue(item, props.rowKey) || index
}

const filteredData = computed(() => {
    if (!searchQuery.value) return props.data

    const query = searchQuery.value.toLowerCase()

    return props.data.filter(item => {
        return props.columns.some(column => {
            const value = getNestedValue(item, column.key)
            if (value === null || value === undefined) return false
            return String(value).toLowerCase().includes(query)
        })
    })
})

const totalPages = computed(() => {
    return Math.ceil(filteredData.value.length / itemsPerPage.value)
})

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredData.value.slice(start, end)
})

const paginationInfo = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value + 1
    const end = Math.min(currentPage.value * itemsPerPage.value, filteredData.value.length)
    return `${start}-${end} de ${filteredData.value.length}`
})

const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages.value, startPage + maxVisible - 1)

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return pages
})

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

watch(searchQuery, () => {
    currentPage.value = 1
})

watch(itemsPerPage, () => {
    currentPage.value = 1
})

const openDeleteModal = (item, index) => {
    let itemName = 'este elemento'

    if (item.fullname) itemName = item.fullname
    else if (item.nombreComercio) itemName = item.nombreComercio
    else if (item.nombre) itemName = item.nombre
    else if (item.titulo) itemName = item.titulo
    else if (item.descripcion) itemName = item.descripcion
    else if (item.name) itemName = item.name
    else if (item.h1) itemName = item.h1
    else if (item.nombreprod) itemName = item.nombreprod
    else if (item.url) itemName = item.url
    else if (item.id) itemName = `ID: ${item.id}`

    const warningMessage = props.deleteWarningGetter ? props.deleteWarningGetter(item) : ''

    deleteModal.value = {
        isOpen: true,
        item: item,
        index: index,
        itemName: itemName,
        tableName: props.tableName,
        warningMessage: warningMessage
    }
}

const closeDeleteModal = () => {
    deleteModal.value = {
        isOpen: false,
        item: null,
        index: null,
        itemName: '',
        tableName: '',
        warningMessage: ''
    }
}

const confirmDelete = () => {
    emit('delete', deleteModal.value.item, deleteModal.value.index)
    closeDeleteModal()
}

const handleDownload = () => {
    downloadTable(props.data, props.columns, props.tableName, selectedFormat.value)
}
</script>
