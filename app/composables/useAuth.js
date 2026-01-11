export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const role = useState('role', () => null)

  const fetchRole = async () => {
    if (!user.value) return

    if (role.value) return role.value

    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.value.id)
      .single()

    role.value = data?.role ?? null
    return role.value
  }

  return { user, role, fetchRole }
}
