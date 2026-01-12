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

  // Check if there are overlapping time slots for the same room on any of the selected days
  async function checkForOverlap(roomId, daysOfWeek, startTime, endTime, excludeId = null) {
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch all recurring availabilities for this room that are still valid
    let query = supabase
      .from('recurring_availability')
      .select('id, days_of_week, start_time, end_time, valid_to')
      .eq('room_id', roomId)
      .or(`valid_to.is.null,valid_to.gte.${today}`)
    
    // Exclude current record when editing
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data: existingAvailabilities, error: err } = await query
    
    if (err) {
      console.error('Error checking for overlaps:', err)
      throw new Error('Error al verificar disponibilidad')
    }
    
    if (!existingAvailabilities || existingAvailabilities.length === 0) {
      return { hasOverlap: false, overlaps: [] }
    }
    
    // Helper function to check if two time ranges overlap
    const timesOverlap = (start1, end1, start2, end2) => {
      return start1 < end2 && start2 < end1
    }
    
    // Helper function to check if two day arrays have common days
    const haveSameDays = (days1, days2) => {
      return days1.some(day => days2.includes(day))
    }
    
    const overlaps = []
    
    for (const existing of existingAvailabilities) {
      // Check if they share any days
      if (haveSameDays(daysOfWeek, existing.days_of_week)) {
        // Check if times overlap
        if (timesOverlap(startTime, endTime, existing.start_time, existing.end_time)) {
          overlaps.push({
            id: existing.id,
            days: existing.days_of_week,
            start_time: existing.start_time,
            end_time: existing.end_time
          })
        }
      }
    }
    
    return {
      hasOverlap: overlaps.length > 0,
      overlaps
    }
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
    deleteRecurringAvailability,
    checkForOverlap
  }
}
