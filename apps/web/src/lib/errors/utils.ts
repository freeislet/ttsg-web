export function normalizeError(error: unknown): Error | undefined {
  if (error instanceof Error) return error
  else if (error !== undefined) return new Error(String(error))
}
