export function useRecurringAvailability() {
  const supabase = useSupabaseClient()

  const recurringAvailabilities = ref([])
  const currentRecurringAvailability = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchRecurringAvailabilities() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('recurring_availability')
      .select(`
        id,
        recurring_name,
        days_of_week,
        start_time,
        end_time,
        timezone,
        valid_from,
        valid_to,
        doctors ( id, fullname ),
        rooms ( id, name )
      `)

    recurringAvailabilities.value = data ?? []
    error.value = err
    loading.value = false
  }

  async function fetchRecurringAvailabilityById(id) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('recurring_availability')
      .select('*')
      .eq('id', id)
      .single()

    currentRecurringAvailability.value = data
    error.value = err
    loading.value = false
  }

  async function createRecurringAvailability(availabilityData) {
    return supabase.from('recurring_availability').insert(availabilityData)
  }

  async function updateRecurringAvailability(id, availabilityData) {
    return supabase
      .from('recurring_availability')
      .update(availabilityData)
      .eq('id', id)
  }

  async function deleteRecurringAvailability(id) {
    return supabase.from('recurring_availability').delete().eq('id', id)
  }

  return {
    recurringAvailabilities,
    currentRecurringAvailability,
    loading,
    error,
    fetchRecurringAvailabilities,
    fetchRecurringAvailabilityById,
    createRecurringAvailability,
    updateRecurringAvailability,
    deleteRecurringAvailability
  }
}
