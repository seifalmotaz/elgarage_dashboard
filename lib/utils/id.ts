export function generateStableValue(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    const char = label.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `opt_${Math.abs(hash).toString(36)}`;
}

export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}