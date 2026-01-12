export function useDoctors() {
  const supabase = useSupabaseClient()

  const doctors = ref([])
  const currentDoctor = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchDoctors() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('doctors')
      .select(`
        *,
        doctor_specializations (
          specializations ( id, name )
        ),
        doctor_sub_specializations (
          sub_specializations ( id, name )
        )
      `)
      .order('fullname')

    doctors.value = data ?? []
    error.value = err
    loading.value = false
  }

  async function fetchDoctorById(id) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('doctors')
      .select(`
        *,
        doctor_specializations (
          specialization_id,
          specializations ( id, name )
        ),
        doctor_sub_specializations (
          sub_specialization_id,
          sub_specializations ( id, name )
        )
      `)
      .eq('id', id)
      .single()

    currentDoctor.value = data
    error.value = err
    loading.value = false
  }

  async function createDoctor(doctorData) {
    return supabase.from('doctors').insert(doctorData)
  }

  async function updateDoctor(id, doctorData) {
    return supabase.from('doctors').update(doctorData).eq('id', id)
  }

  async function deleteDoctor(id) {
    return supabase.from('doctors').delete().eq('id', id)
  }

  return {
    doctors,
    currentDoctor,
    loading,
    error,
    fetchDoctors,
    fetchDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor
  }
}
