export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const role = useState('role', () => null)

  const fetchRole = async () => {
    const userId = user.value?.sub
    
    if (!userId) {
      role.value = null
      return null
    }

    if (role.value) {
      return role.value
    }

    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()

    role.value = data?.role ?? null
    return role.value
  }

  // Watch for user logout and clear role
  watch(user, (newUser) => {
    if (!newUser) {
      role.value = null
    }
  })

  return { user, role, fetchRole }
}
