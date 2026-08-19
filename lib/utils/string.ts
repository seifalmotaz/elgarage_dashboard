export function truncateId(id: string | undefined, length = 8): string {
  if (!id) return '--------';
  return id.slice(0, Math.min(length, id.length)).toUpperCase();
}

export function slugToWords(slug: string): string {
  return slug.replace(/_/g, ' ');
}

/**
 * Generate a unique key from text.
 * Uses hash-based approach to ensure uniqueness and support any language (including Arabic).
 * @param text - The text to generate a key from
 * @returns A unique hash-based key (e.g., "q_1a2b3c")
 */
export function generateKeyFromText(text: string): string {
  const hash = generateHash(text);
  return `q_${hash}`;
}

/**
 * Generate a hash from text using simple algorithm.
 * Works with any character set including Arabic.
 * @param text - The text to hash
 * @returns A base-36 encoded hash string
 */
function generateHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0; // |0 keeps it 32-bit
  }
  return Math.abs(hash).toString(36);
}