// Component test: MovieDetail validation path for movieId that is not a positive integer (no TMDB fetch).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, RouterView } from 'vue-router'
import { nextTick } from 'vue'
import MovieDetail from '../pages/MovieDetail.vue'

describe('MovieDetail (invalid id)', () => {
  beforeEach(() => {
    // A non-empty key makes hasApiKey true so the detail page runs validation; invalid numeric ids should error before any fetch.
    vi.stubEnv('VITE_TMDB_API_KEY', 'test-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // Route param movieId "0" parses to id 0, which the effect treats as invalid—user should see the inline error, not a loading spinner forever.
  it('shows Invalid movie ID when the route param is not a positive integer', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/movie/:movieId', component: MovieDetail },
      ],
    })
    await router.push('/movie/0')
    await router.isReady()

    const wrapper = mount(RouterView, {
      global: { plugins: [router] },
    })

    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('Invalid movie ID.')
  })
})
