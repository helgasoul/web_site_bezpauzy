/**
 * Validation utilities
 */

/**
 * Validates email address
 * Supports standard email formats
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const trimmedEmail = email.trim()
  if (!trimmedEmail) {
    return false
  }

  // Standard email regex - supports most valid email formats
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(trimmedEmail)
}

/**
 * Validates email and returns normalized email (lowercase, trimmed)
 * Returns null if invalid
 */
export function normalizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null
  }

  const trimmed = email.trim()
  if (!trimmed) {
    return null
  }

  if (!validateEmail(trimmed)) {
    return null
  }

  return trimmed.toLowerCase()
}
