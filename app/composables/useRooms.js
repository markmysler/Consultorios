export function useRooms() {
  const supabase = useSupabaseClient()

  const rooms = ref([])
  const currentRoom = (null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchRooms() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('rooms')
      .select(`
        id,
        name,
        floor_id,
        floors ( id, name )
      `)

    rooms.value = data ?? []
    error.value = err
    loading.value = false
  }

  async function fetchRoomById(id) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single()

    currentRoom.value = data
    error.value = err
    loading.value = false
  }

  async function createRoom(roomData) {
    return supabase.from('rooms').insert(roomData)
  }

  async function updateRoom(id, roomData) {
    return supabase.from('rooms').update(roomData).eq('id', id)
  }

  async function deleteRoom(id) {
    return supabase.from('rooms').delete().eq('id', id)
  }

  return {
    rooms,
    currentRoom,
    loading,
    error,
    fetchRooms,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom
  }
}
