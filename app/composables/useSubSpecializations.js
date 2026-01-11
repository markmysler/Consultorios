export function useSubSpecializations() {
  const supabase = useSupabaseClient()

  const subSpecializations = ref([])
  const currentSubSpecialization = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchSubSpecializations() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('sub_specializations')
      .select('*')
      .order('name')

    subSpecializations.value = data ?? []
    error.value = err
    loading.value = false
  }

  async function fetchSubSpecializationById(id) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('sub_specializations')
      .select('*')
      .eq('id', id)
      .single()

    currentSubSpecialization.value = data
    error.value = err
    loading.value = false
  }

  return {
    subSpecializations,
    currentSubSpecialization,
    loading,
    error,
    fetchSubSpecializations,
    fetchSubSpecializationById
  }
}
