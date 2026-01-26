/**
 * XSS Protection utilities
 * Sanitizes user-generated content before storing or displaying
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content
 * Removes dangerous scripts, events, and other XSS vectors
 * 
 * @param dirty - Unsanitized HTML string
 * @param allowLinks - Whether to allow <a> tags (default: false)
 * @returns Sanitized HTML string safe for display
 */
export function sanitizeHTML(dirty: string, allowLinks: boolean = false): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  const config: Parameters<typeof DOMPurify.sanitize>[1] = {
    ALLOWED_TAGS: allowLinks 
      ? ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'a', 'ul', 'ol', 'li', 'blockquote']
      : ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: allowLinks 
      ? ['href', 'target', 'rel']
      : [],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  }

  // Если ссылки разрешены, добавляем безопасные атрибуты
  if (allowLinks) {
    config.ALLOWED_ATTR = ['href', 'target', 'rel']
    // Добавляем rel="noopener noreferrer" для безопасности
    config.ADD_ATTR = ['target']
  }

  return DOMPurify.sanitize(dirty, config)
}

/**
 * Sanitize plain text (removes all HTML)
 * Use this for fields that should only contain plain text
 * 
 * @param dirty - Text that may contain HTML
 * @returns Plain text with all HTML removed
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  // Remove all HTML tags and decode entities
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })
}

/**
 * Sanitize user input for storage
 * Strips HTML and limits length
 * 
 * @param input - User input string
 * @param maxLength - Maximum allowed length (default: 5000)
 * @returns Sanitized plain text
 */
export function sanitizeInput(input: string, maxLength: number = 5000): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove HTML and trim
  let sanitized = sanitizeText(input).trim()

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Sanitize for display (allows basic formatting)
 * Use this when displaying user content that may contain formatting
 * 
 * @param content - Content to sanitize
 * @param allowLinks - Whether to allow links (default: false)
 * @returns Sanitized HTML safe for React dangerouslySetInnerHTML
 */
export function sanitizeForDisplay(content: string, allowLinks: boolean = false): string {
  return sanitizeHTML(content, allowLinks)
}

