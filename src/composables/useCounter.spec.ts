import { describe, it, expect, beforeEach } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  beforeEach(() => {})

  describe('incrementCount', () => {
    it('increments count by 1', () => {
      const { count, incrementCount } = useCounter(0)

      expect(count.value).toBe(0)

      incrementCount()
      expect(count.value).toBe(1)

      incrementCount()
      expect(count.value).toBe(2)
    })

    it('increments from initial value', () => {
      const { count, incrementCount } = useCounter(5)

      incrementCount()
      expect(count.value).toBe(6)
    })
  })

  describe('decrementCount', () => {
    it('decrements count by 1', () => {
      const { count, decrementCount } = useCounter(5)

      decrementCount()
      expect(count.value).toBe(4)

      decrementCount()
      expect(count.value).toBe(3)
    })

    it('can go below zero', () => {
      const { count, decrementCount } = useCounter(1)

      decrementCount()
      decrementCount()
      expect(count.value).toBe(-1)
    })
  })

  describe('clearCount', () => {
    it('resets count to 0', () => {
      const { count, incrementCount, clearCount } = useCounter(0)

      incrementCount()
      incrementCount()
      expect(count.value).toBe(2)

      clearCount()
      expect(count.value).toBe(0)
    })

    it('resets count from negative value', () => {
      const { count, decrementCount, clearCount } = useCounter(0)

      decrementCount()
      decrementCount()
      expect(count.value).toBe(-2)

      clearCount()
      expect(count.value).toBe(0)
    })
  })

  describe('combined usage', () => {
    it('increment, decrement, and clear work together', () => {
      const { count, incrementCount, decrementCount, clearCount } =
        useCounter(0)

      incrementCount()
      incrementCount()
      incrementCount()
      expect(count.value).toBe(3)

      decrementCount()
      expect(count.value).toBe(2)

      clearCount()
      expect(count.value).toBe(0)

      incrementCount()
      expect(count.value).toBe(1)
    })
  })
})
