// generates user id without need for authentication / sign in
export function getUserId(): string {
  if (typeof window === 'undefined') return ''
  
  let userId = localStorage.getItem('userId')
  if (!userId) {
    // Generate a new UUID (simple version without external library)
    userId = crypto.randomUUID()
    localStorage.setItem('userId', userId)
  }
  return userId
}

export function clearUserId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userId')
  }
}

