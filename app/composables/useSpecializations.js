export function useSpecializations() {
  const supabase = useSupabaseClient()

  const specializations = ref([])
  const currentSpecialization = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchSpecializations() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('specializations')
      .select('*')
      .order('name')

    specializations.value = data ?? []
    error.value = err
    loading.value = false
  }

  async function fetchSpecializationById(id) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('specializations')
      .select('*')
      .eq('id', id)
      .single()

    currentSpecialization.value = data
    error.value = err
    loading.value = false
  }

  return {
    specializations,
    currentSpecialization,
    loading,
    error,
    fetchSpecializations,
    fetchSpecializationById
  }
}
