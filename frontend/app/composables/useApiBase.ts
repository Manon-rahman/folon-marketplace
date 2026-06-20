export function useApiBase(): string {
  const config = useRuntimeConfig()
  return import.meta.server ? config.apiBase : config.public.apiBase
}
