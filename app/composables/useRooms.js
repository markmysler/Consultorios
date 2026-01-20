export function useRooms() {
  const supabase = useSupabaseClient()

  const rooms = ref([])
  const currentRoom = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchRooms(checkDateTime = null) {
    loading.value = true
    
    try {
      const targetDateTime = checkDateTime || new Date().toISOString()
      
      const { data, error: err } = await supabase
        .rpc('get_rooms_availability', {
          check_datetime: targetDateTime
        })


      if (err) {
        error.value = err
        console.error('Error fetching rooms availability:', err)
        rooms.value = []
      } else {
        rooms.value = (data || []).map(row => ({
          id: row.room_id,
          name: row.room_name,
          floor_id: row.floor_id,
          floors: {
            id: row.floor_id,
            name: row.floor_name
          },
          is_available: row.is_available
        }))
        error.value = null
      }
    } catch (err) {
      console.error('Error in fetchRooms:', err)
      error.value = err
      rooms.value = []
    }

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
