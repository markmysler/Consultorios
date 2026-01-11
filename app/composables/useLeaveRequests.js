export function useLeaveRequests() {
  const supabase = useSupabaseClient()

  const leaveRequests = ref([])
  const currentLeaveRequest = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchLeaveRequests() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('leave_requests')
      .select(`
        id,
        start_at,
        end_at,
        leave_type,
        doctors ( id, fullname )
      `)
      .order('start_at')

    leaveRequests.value = data ?? []
    error.value = err
    loading.value = false
  }

  async function fetchLeaveRequestById(id) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single()

    currentLeaveRequest.value = data
    error.value = err
    loading.value = false
  }

  async function createLeaveRequest(leaveRequestData) {
    return supabase.from('leave_requests').insert(leaveRequestData)
  }

  async function updateLeaveRequest(id, leaveRequestData) {
    return supabase.from('leave_requests').update(leaveRequestData).eq('id', id)
  }

  async function deleteLeaveRequest(id) {
    return supabase.from('leave_requests').delete().eq('id', id)
  }

  return {
    leaveRequests,
    currentLeaveRequest,
    loading,
    error,
    fetchLeaveRequests,
    fetchLeaveRequestById,
    createLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest
  }
}
