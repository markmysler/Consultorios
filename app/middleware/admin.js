export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchRole } = useAuth()

  if (!user.value) return navigateTo('/login')

  const role = await fetchRole()
  if (role !== 'admin') return navigateTo('/')
})