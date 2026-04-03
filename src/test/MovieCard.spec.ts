// Component test (co-located under test/): MovieCard presentation and poster URL rules with memory router for <RouterLink>.
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import MovieCard from '../components/MovieCard.vue'
import { TMDB_IMAGE_BASE } from '../lib/api_client'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/movie/:movieId', component: { template: '<div />' } },
    ],
  })
}

describe('MovieCard', () => {
  // Exercises the main card UI: detail link, title/year/rating line, TMDB-relative vs absolute poster URLs, and the no-poster placeholder (three quick scenarios in one test to avoid duplicate router setup).
  it('renders link, meta line, relative poster path, and placeholder when poster is missing', async () => {
    const router1 = createTestRouter()
    await router1.push('/')
    await router1.isReady()

    const w1 = mount(MovieCard, {
      global: { plugins: [router1] },
      props: {
        id: 42,
        title: 'Demo Film',
        posterPath: '/abc.jpg',
        voteAverage: 8.25,
        releaseDate: '2019-06-01',
      },
    })

    const link1 = w1.find('a.movie-card')
    expect(link1.attributes('href')).toBe('/movie/42')
    expect(link1.attributes('aria-label')).toMatch(
      /view details for demo film/i,
    )
    expect(w1.find('h2.movie-card__title').text()).toBe('Demo Film')
    expect(w1.text()).toMatch(/2019/)
    expect(w1.text()).toMatch(/8\.3/)
    const img1 = w1.find('.movie-card__poster').element as HTMLImageElement
    expect(img1.getAttribute('src')).toBe(`${TMDB_IMAGE_BASE}/abc.jpg`)

    w1.unmount()

    const router2 = createTestRouter()
    await router2.push('/')
    await router2.isReady()

    const w2 = mount(MovieCard, {
      global: { plugins: [router2] },
      props: {
        id: 1,
        title: 'Remote Poster',
        posterPath: 'https://example.com/poster.png',
        voteAverage: 7,
        releaseDate: '2020-01-01',
      },
    })
    const img2 = w2.find('.movie-card__poster').element as HTMLImageElement
    expect(img2.getAttribute('src')).toBe('https://example.com/poster.png')

    w2.unmount()

    const router3 = createTestRouter()
    await router3.push('/')
    await router3.isReady()

    const w3 = mount(MovieCard, {
      global: { plugins: [router3] },
      props: {
        id: 3,
        title: 'No Poster',
        posterPath: null,
        voteAverage: 6,
      },
    })
    expect(w3.find('.movie-card__poster--placeholder').exists()).toBe(true)
    expect(w3.find('img').exists()).toBe(false)
  })
})
