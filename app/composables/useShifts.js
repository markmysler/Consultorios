export function useShifts() {
  const supabase = useSupabaseClient()

  const shifts = ref([])
  const currentShift = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchShifts() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('shifts')
      .select('*')
      .order('name')

    shifts.value = data ?? []
    error.value = err
    loading.value = false
  }

  async function fetchShiftById(id) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', id)
      .single()

    currentShift.value = data
    error.value = err
    loading.value = false
  }

  return {
    shifts,
    currentShift,
    loading,
    error,
    fetchShifts,
    fetchShiftById
  }
}
