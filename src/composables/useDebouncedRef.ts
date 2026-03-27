import { ref, watch, type Ref } from 'vue'

export function useDebouncedRef<T>(source: Ref<T>, ms: number): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  watch(source, (value, _old, onCleanup) => {
    const id = globalThis.setTimeout(() => {
      debounced.value = value
    }, ms)
    onCleanup(() => globalThis.clearTimeout(id))
  })
  return debounced
}
