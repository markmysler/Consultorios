export function useFloors() {
  const supabase = useSupabaseClient()

  const floors = ref([])
  const currentFloor = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchFloors() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('floors')
      .select('*')
      .order('display_order')

    floors.value = data ?? []
    error.value = err
    loading.value = false
  }

  async function fetchFloorById(id) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('floors')
      .select('*')
      .eq('id', id)
      .single()

    currentFloor.value = data
    error.value = err
    loading.value = false
  }

  async function createFloor(floorData) {
    return supabase.from('floors').insert(floorData)
  }

  async function updateFloor(id, floorData) {
    return supabase.from('floors').update(floorData).eq('id', id)
  }

  async function deleteFloor(id) {
    return supabase.from('floors').delete().eq('id', id)
  }

  return {
    floors,
    currentFloor,
    loading,
    error,
    fetchFloors,
    fetchFloorById,
    createFloor,
    updateFloor,
    deleteFloor
  }
}
