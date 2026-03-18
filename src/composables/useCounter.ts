import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  function incrementCount() {
    count.value++
  }

  function decrementCount() {
    count.value -= 1
  }

  function clearCount() {
    count.value = 0
  }

  return {
    count,
    incrementCount,
    decrementCount,
    clearCount,
  }
}
