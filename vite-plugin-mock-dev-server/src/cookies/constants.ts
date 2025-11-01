/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

export const fieldContentRegExp: RegExp = /^[\t\u0020-\u007E\u0080-\u00FF]+$/

/**
 * RegExp to match Priority cookie attribute value.
 */

export const PRIORITY_REGEXP: RegExp = /^(?:low|medium|high)$/i

/**
 * Cache for generated name regular expressions.
 */

export const REGEXP_CACHE: Record<string, RegExp> = Object.create(null)

/**
 * RegExp to match all characters to escape in a RegExp.
 */

export const REGEXP_ESCAPE_CHARS_REGEXP: RegExp = /[\^$\\.*+?()[\]{}|]/g

/**
 * RegExp to match basic restricted name characters for loose validation.
 */

export const RESTRICTED_NAME_CHARS_REGEXP: RegExp = /[;=]/

/**
 * RegExp to match basic restricted value characters for loose validation.
 */

export const RESTRICTED_VALUE_CHARS_REGEXP: RegExp = /;/

/**
 * RegExp to match Same-Site cookie attribute value.
 */

export const SAME_SITE_REGEXP: RegExp = /^(?:lax|none|strict)$/i
